import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Connects the app to the RideTrack backend: a Firebase project whose rules, indexes and seed
 * data live in the separate backend repository. Keys come from .env.
 * Setup guide: docs/design/BACKEND.md
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** True when .env has the Firebase keys. When false, screens keep using sample data. */
export const isBackendConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

/** True when the app is pointed at the local Firebase emulators instead of the real project. */
export const isUsingEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';

type Backend = { app: FirebaseApp; auth: Auth; db: Firestore };
let backend: Backend | null = null;

/**
 * Returns the Firebase app, auth and database, creating them on first use.
 * Throws a clear error if .env is missing, instead of crashing at start-up.
 */
export function getBackend(): Backend {
  if (backend) return backend;
  if (!isBackendConfigured) {
    throw new Error('Backend is not configured. Copy .env.example to .env and fill in the Firebase keys.');
  }

  const firstInit = getApps().length === 0;
  const app = firstInit ? initializeApp(firebaseConfig) : getApp();

  // Keep the user signed in between restarts. initializeAuth only works once per app,
  // so fall back to getAuth when the app reloads during development.
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }
  const db = getFirestore(app);

  if (firstInit && isUsingEmulator) {
    const host = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? 'localhost';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
  }

  backend = { app, auth, db };
  return backend;
}
