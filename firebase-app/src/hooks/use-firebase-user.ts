import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { getBackend, isBackendConfigured } from '@/lib/firebase';

/**
 * The signed-in Firebase user. `undefined` while Firebase is still checking, `null` when nobody
 * is signed in (or the backend is not configured). Rules only let signed-in users read data.
 */
export function useFirebaseUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (!isBackendConfigured) return;
    return onAuthStateChanged(getBackend().auth, setUser);
  }, []);

  return isBackendConfigured ? user : null;
}
