import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import { query, withTransaction } from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError, conflict, unauthorized } from '../../utils/errors.js';
import { toUser } from '../users/service.js';

const BCRYPT_ROUNDS = 10;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const signAccess = (user) => jwt.sign({ role: user.role }, env.jwtAccessSecret, { subject: String(user.user_id), expiresIn: env.accessTtl });

/** Creates a refresh token, stores only its hash, and returns the raw value to the client once. Admin sessions expire sooner. */
async function issueRefresh(user, conn = null) {
  const raw = crypto.randomBytes(48).toString('base64url');
  const ttlMs = user.role === 'ADMIN' ? env.adminRefreshTtlHours * 3600000 : env.jwtRefreshTtlDays * 86400000;
  const expires = new Date(Date.now() + ttlMs);
  const sql = 'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)';
  if (conn) await conn.query(sql, [user.user_id, sha256(raw), expires]);
  else await query(sql, [user.user_id, sha256(raw), expires]);
  return raw;
}

async function authResult(row) {
  return { user: toUser(row), accessToken: signAccess(row), refreshToken: await issueRefresh(row) };
}

/** Public sign-up always creates a PASSENGER. Staff, officers and admins are created by an admin (POST /admin/users, scripts/create-admin.js). */
export async function register({ name, email, phone, password }) {
  const hash = await hashPassword(password);
  try {
    const result = await query('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
      name,
      email ?? null,
      phone ?? null,
      hash,
      'PASSENGER',
    ]);
    const [row] = await query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
    return authResult(row);
  } catch (e) {
    if (e?.code === 'ER_DUP_ENTRY') throw conflict('An account with these details already exists.', 'ACCOUNT_EXISTS');
    throw e;
  }
}

// A real hash to compare against when the account does not exist, so response time does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

/** The active account with this email or phone and password, or null. */
async function checkCredentials(column, value, password) {
  const [row] = await query(`SELECT * FROM users WHERE ${column} = ?`, [value]);
  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  return row && ok && row.is_active ? row : null;
}

/** App sign-in. Admin accounts are refused here, so an admin session only ever comes from adminLogin. */
export async function login({ identifier, password }) {
  const row = await checkCredentials(identifier.includes('@') ? 'email' : 'phone', identifier, password);
  // one message for unknown account, wrong password, disabled account and admin account
  if (!row || row.role === 'ADMIN') throw unauthorized('Invalid email/phone or password.', 'INVALID_CREDENTIALS');
  return authResult(row);
}

/** Admin sign-in: admin accounts only, by email. */
export async function adminLogin({ email, password }) {
  const row = await checkCredentials('email', email, password);
  if (!row || row.role !== 'ADMIN') throw unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  return authResult(row);
}

const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

/**
 * Checks a Google ID token with Google's tokeninfo endpoint (which verifies the signature and expiry)
 * and that it was issued to one of our OAuth clients. Returns the token's claims.
 */
async function verifyGoogleIdToken(idToken) {
  if (env.googleClientIds.length === 0) throw new AppError(503, 'GOOGLE_DISABLED', 'Google sign-in is not available right now.');
  let res;
  try {
    res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new AppError(503, 'GOOGLE_UNAVAILABLE', 'Cannot reach Google right now. Please try again.');
  }
  const claims = res.ok ? await res.json() : null;
  if (
    !claims ||
    !env.googleClientIds.includes(claims.aud) ||
    !GOOGLE_ISSUERS.includes(claims.iss) ||
    Number(claims.exp) * 1000 < Date.now() ||
    !claims.email ||
    String(claims.email_verified) !== 'true'
  ) {
    throw unauthorized('Google sign-in failed. Please try again.', 'GOOGLE_TOKEN_INVALID');
  }
  return claims;
}

/**
 * Signs in with Google. A verified Google email that matches an existing account logs into it;
 * otherwise a new PASSENGER is created. Google-only accounts get an unusable random password.
 */
export async function googleLogin(idToken) {
  const claims = await verifyGoogleIdToken(idToken);
  const email = claims.email.toLowerCase();
  const findUser = async () => (await query('SELECT * FROM users WHERE email = ?', [email]))[0];

  let row = await findUser();
  if (!row) {
    const name = (claims.name || email.split('@')[0]).trim().slice(0, 100);
    const hash = await bcrypt.hash(crypto.randomBytes(32).toString('base64url'), BCRYPT_ROUNDS);
    try {
      await query('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, NULL, ?, ?)', [name, email, hash, 'PASSENGER']);
    } catch (e) {
      // a parallel sign-in created it first
      if (e?.code !== 'ER_DUP_ENTRY') throw e;
    }
    row = await findUser();
  }
  if (!row?.is_active) throw unauthorized('This account is disabled.', 'ACCOUNT_DISABLED');
  // admin sessions only ever come from adminLogin
  if (row.role === 'ADMIN') throw unauthorized('Google sign-in failed. Please try again.', 'GOOGLE_TOKEN_INVALID');
  return authResult(row);
}

/**
 * Rotates the refresh token: the old one is revoked and a new pair is returned. Re-using a revoked token fails.
 * Admin and app sessions stay apart: with `admin` only admin tokens are accepted, without it admin tokens are refused.
 */
export async function refresh(rawToken, { admin = false } = {}) {
  const hash = sha256(rawToken);
  return withTransaction(async (conn) => {
    const [[tokenRow]] = await conn.query('SELECT * FROM refresh_tokens WHERE token_hash = ? FOR UPDATE', [hash]);
    if (!tokenRow || tokenRow.revoked || new Date(tokenRow.expires_at) < new Date()) {
      throw unauthorized('Your session has expired. Please log in again.', 'REFRESH_INVALID');
    }
    const [[user]] = await conn.query('SELECT * FROM users WHERE user_id = ? AND is_active = TRUE', [tokenRow.user_id]);
    if (!user || (user.role === 'ADMIN') !== admin) throw unauthorized('Your session has expired. Please log in again.', 'REFRESH_INVALID');
    await conn.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_id = ?', [tokenRow.token_id]);
    return { accessToken: signAccess(user), refreshToken: await issueRefresh(user, conn) };
  });
}

/** Ends one session. Unknown or already revoked tokens are ignored, so logging out always succeeds. */
export async function logout(rawToken) {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?', [sha256(rawToken)]);
}

/** Ends every session of an account. Access tokens already issued still work until they expire (JWT_ACCESS_TTL). */
export async function revokeSessions(userId) {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ? AND revoked = FALSE', [userId]);
}
