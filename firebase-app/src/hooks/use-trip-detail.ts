import { useEffect, useMemo, useState } from 'react';

import { useFirebaseUser } from '@/hooks/use-firebase-user';
import { isBackendConfigured } from '@/lib/firebase';
import { getTripDetail } from '@/lib/trip-data';
import { subscribeTripDetail } from '@/lib/trip-live';
import type { TripDetail } from '@/types/models';

/** Give up waiting for Firestore after this long and look for the trip in the sample data. */
const SLOW_MS = 8000;

/**
 * One trip with its route, vehicle and stop times, for Transport Details, Route & Stops and
 * Live Tracking. Listens to Firestore and updates live; falls back to the sample data when the
 * backend is not configured, nobody is signed in, there is an error or it is slow.
 * `detail` is undefined (with `loading` false) when the trip does not exist.
 */
export function useTripDetail(scheduleId: string): { detail: TripDetail | undefined; loading: boolean } {
  const sample = useMemo(() => getTripDetail(scheduleId), [scheduleId]);
  const user = useFirebaseUser();
  const [live, setLive] = useState<{ detail: TripDetail | undefined } | undefined>();
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    // Clear this run's results when it ends (trip or user changed).
    const reset = () => {
      setLive(undefined);
      setFailed(false);
      setSlow(false);
    };
    if (!isBackendConfigured || !user) return reset;

    const unsubscribe = subscribeTripDetail(
      scheduleId,
      (detail) => setLive({ detail }),
      () => setFailed(true),
    );
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => {
      unsubscribe();
      clearTimeout(timer);
      reset();
    };
  }, [scheduleId, user]);

  if (!isBackendConfigured || user === null || failed) return { detail: sample, loading: false };
  if (user === undefined) return { detail: undefined, loading: true };
  if (!live) return slow ? { detail: sample, loading: false } : { detail: undefined, loading: true };
  return { detail: live.detail, loading: false };
}
