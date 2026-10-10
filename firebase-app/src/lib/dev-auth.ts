import { signInWithEmailAndPassword } from 'firebase/auth';

import type { Role } from '@/constants/theme';

import { getBackend, isBackendConfigured } from './firebase';

/**
 * TEMPORARY: signs in as one of the seeded test accounts so the app can read Firestore before the
 * real login screens exist. The emails are the seeded ones (see docs/design/BACKEND.md); the
 * password comes from EXPO_PUBLIC_DEV_TEST_PASSWORD in your .env, never from the source code.
 * Remove this file when real sign-in is built.
 */
const testEmails: Record<Role, string> = {
  passenger: 'passenger@ridetrack.test',
  conductor: 'conductor@ridetrack.test',
  authority: 'authority@ridetrack.test',
};

/** True when a test sign-in can be attempted (backend configured and a test password is set). */
export const canUseTestSignIn = isBackendConfigured && Boolean(process.env.EXPO_PUBLIC_DEV_TEST_PASSWORD);

/** Returns null on success, or a short reason on failure. Never throws. */
export async function signInAsTestUser(role: Role): Promise<string | null> {
  if (!canUseTestSignIn) return 'Test sign-in is not set up in .env';
  try {
    const { auth } = getBackend();
    if (auth.currentUser?.email === testEmails[role]) return null;
    await signInWithEmailAndPassword(auth, testEmails[role], process.env.EXPO_PUBLIC_DEV_TEST_PASSWORD as string);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Sign-in failed';
  }
}
