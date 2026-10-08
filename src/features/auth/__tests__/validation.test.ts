import { loginSchema, registerSchema } from '../validation';

describe('login validation', () => {
  it('accepts an email or a phone number', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: '077 123 4567', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty or malformed identifier with a clear message', () => {
    const empty = loginSchema.safeParse({ identifier: '', password: 'x' });
    expect(empty.success).toBe(false);
    const bad = loginSchema.safeParse({ identifier: 'not-an-email', password: 'x' });
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toMatch(/valid email/i);
  });

  it('requires a password', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.co', password: '' }).success).toBe(false);
  });
});

describe('register validation', () => {
  const ok = { name: 'Nimal Perera', identifier: 'nimal@example.com', password: 'abcdefg1', confirmPassword: 'abcdefg1' };

  it('accepts a valid form', () => {
    expect(registerSchema.safeParse(ok).success).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(registerSchema.safeParse({ ...ok, password: 'short1', confirmPassword: 'short1' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, password: 'abcdefgh', confirmPassword: 'abcdefgh' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, password: '12345678', confirmPassword: '12345678' }).success).toBe(false);
  });

  it('rejects mismatched passwords on the confirm field', () => {
    const r = registerSchema.safeParse({ ...ok, confirmPassword: 'different1' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(['confirmPassword']);
  });
});
