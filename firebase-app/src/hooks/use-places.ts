import { useEffect, useMemo, useState } from 'react';

import type { TransportType } from '@/constants/transport';
import { useFirebaseUser } from '@/hooks/use-firebase-user';
import { isBackendConfigured } from '@/lib/firebase';
import { subscribeRoutes } from '@/lib/home-live';
import { getPlaces, placesFromRoutes } from '@/lib/search-data';

/** Give up waiting for Firestore after this long and use sample places instead. */
const SLOW_MS = 8000;

/**
 * Places a passenger can search between, for the chosen transport: the start and end of every
 * published route in Firestore. Falls back to the sample places when the backend is not
 * configured, nobody is signed in, there is an error or Firestore is slow, so suggestions
 * never disappear.
 */
export function usePlaces(transport: TransportType | null): string[] {
  const sample = useMemo(() => (transport ? getPlaces(transport) : []), [transport]);
  const user = useFirebaseUser();
  const [live, setLive] = useState<string[] | undefined>();
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    // Clear this run's results when it ends (transport or user changed).
    const reset = () => {
      setLive(undefined);
      setFailed(false);
      setSlow(false);
    };
    if (!isBackendConfigured || !transport || !user) return reset;

    const unsubscribe = subscribeRoutes(
      transport,
      (routes) => setLive(placesFromRoutes(routes)),
      () => setFailed(true),
    );
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => {
      unsubscribe();
      clearTimeout(timer);
      reset();
    };
  }, [transport, user]);

  if (!isBackendConfigured || !user || failed) return sample;
  if (live === undefined) return slow ? sample : [];
  return live;
}
