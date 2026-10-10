import { useEffect, useMemo, useState } from 'react';

import type { TransportType } from '@/constants/transport';
import { useFirebaseUser } from '@/hooks/use-firebase-user';
import { isBackendConfigured } from '@/lib/firebase';
import { subscribeRoutes, subscribeVehicles } from '@/lib/home-live';
import { resolveSchedule, subscribeSchedules, type LiveSchedule } from '@/lib/results-live';
import { buildResults, getResults } from '@/lib/search-data';
import type { Route, TripResult, Vehicle } from '@/types/models';

/** Give up waiting for Firestore after this long and show sample trips instead. */
const SLOW_MS = 8000;

export type ResultsData = {
  results: TripResult[];
  loading: boolean;
  /** True when the trips come from Firestore, false when they are sample data. */
  live: boolean;
};

/**
 * Every trip between two places for the chosen transport, ready for Results to filter and sort.
 * Listens to Firestore (routes, vehicles, schedules) and updates live; falls back to the sample
 * trips when the backend is not configured, nobody is signed in, there is an error or it is slow.
 */
export function useResults(transport: TransportType | null, from: string, to: string): ResultsData {
  const sample = useMemo(() => (transport ? getResults(transport, from, to) : []), [transport, from, to]);
  const user = useFirebaseUser();
  const [data, setData] = useState<{ routes?: Route[]; vehicles?: Vehicle[]; schedules?: LiveSchedule[] }>({});
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    // Clear this run's results when it ends (transport or user changed).
    const reset = () => {
      setData({});
      setFailed(false);
      setSlow(false);
    };
    if (!isBackendConfigured || !transport || !user) return reset;

    const fail = () => setFailed(true);
    const unsubscribers = [
      subscribeRoutes(transport, (routes) => setData((s) => ({ ...s, routes })), fail),
      subscribeVehicles(transport, (vehicles) => setData((s) => ({ ...s, vehicles })), fail),
      subscribeSchedules(transport, (schedules) => setData((s) => ({ ...s, schedules })), fail),
    ];
    const timer = setTimeout(() => setSlow(true), SLOW_MS);
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      clearTimeout(timer);
      reset();
    };
  }, [transport, user]);

  const { routes, vehicles, schedules } = data;
  const liveResults = useMemo(
    () =>
      routes && vehicles && schedules
        ? buildResults(
            routes,
            schedules.map((s) =>
              resolveSchedule(
                s,
                vehicles.find((v) => v.id === s.vehicleId),
              ),
            ),
            vehicles,
            from,
            to,
          )
        : [],
    [routes, vehicles, schedules, from, to],
  );

  if (!isBackendConfigured || user === null || failed) return { results: sample, loading: false, live: false };
  if (user === undefined) return { results: [], loading: true, live: false };
  if (!routes || !vehicles || !schedules) {
    return slow ? { results: sample, loading: false, live: false } : { results: [], loading: true, live: true };
  }
  return { results: liveResults, loading: false, live: true };
}
