import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';

import type { TransportType } from '@/constants/transport';
import { getBackend, isBackendConfigured } from '@/lib/firebase';
import { getAlerts, getNearbyVehicles, getPopularRoutes } from '@/lib/home-data';
import { subscribeAlerts, subscribeRoutes, subscribeVehicles } from '@/lib/home-live';
import type { Alert, Route, Vehicle } from '@/types/models';

/** Where the data on screen came from, and why. */
export type HomeSource =
  | { kind: 'live' }
  | { kind: 'sample'; reason: 'not-configured' | 'signed-out' | 'error' | 'slow'; detail?: string };

export type HomeData = {
  vehicles: Vehicle[];
  /** Every published route of the chosen type. */
  routes: Route[];
  alerts: Alert[];
  loading: boolean;
  source: HomeSource;
};

/** Give up waiting for Firestore after this long and show sample data instead. */
const SLOW_MS = 8000;

/**
 * Data for the passenger Home screen, always for the chosen transport.
 * With the backend configured and a signed-in user it listens to Firestore and updates live.
 * Otherwise (no keys, not signed in, an error or a very slow connection) it shows the sample
 * data so the screen never goes blank.
 */
export function useHomeData(transport: TransportType | null): HomeData {
  const sample = useMemo(
    () =>
      transport
        ? { vehicles: getNearbyVehicles(transport), routes: getPopularRoutes(transport), alerts: getAlerts(transport) }
        : { vehicles: [], routes: [], alerts: [] },
    [transport],
  );

  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking
  const [live, setLive] = useState<{ vehicles?: Vehicle[]; routes?: Route[]; alerts?: Alert[] }>({});
  const [failure, setFailure] = useState<string | undefined>();
  const [slow, setSlow] = useState(false);

  // Who is signed in. Rules only let signed-in users read data.
  useEffect(() => {
    if (!isBackendConfigured) return;
    return onAuthStateChanged(getBackend().auth, setUser);
  }, []);

  // Listen to Firestore for the chosen transport.
  useEffect(() => {
    // Whatever happens below, clear this run's results when it ends (transport or user changed).
    const reset = () => {
      setLive({});
      setFailure(undefined);
      setSlow(false);
    };
    if (!isBackendConfigured || !transport || !user) return reset;

    const fail = (error: { code?: string; message: string }) => setFailure(error.code ?? error.message);
    const unsubscribers = [
      subscribeVehicles(transport, (vehicles) => setLive((s) => ({ ...s, vehicles })), fail),
      subscribeRoutes(transport, (routes) => setLive((s) => ({ ...s, routes })), fail),
      subscribeAlerts(transport, (alerts) => setLive((s) => ({ ...s, alerts })), fail),
    ];
    const timer = setTimeout(() => setSlow(true), SLOW_MS);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      clearTimeout(timer);
      reset();
    };
  }, [transport, user]);

  if (!isBackendConfigured) {
    return { ...sample, loading: false, source: { kind: 'sample', reason: 'not-configured' } };
  }
  if (user === undefined) {
    return { ...sample, loading: true, source: { kind: 'sample', reason: 'signed-out' } };
  }
  if (user === null) {
    return { ...sample, loading: false, source: { kind: 'sample', reason: 'signed-out' } };
  }
  if (failure) {
    return { ...sample, loading: false, source: { kind: 'sample', reason: 'error', detail: failure } };
  }

  const loaded = live.vehicles !== undefined && live.routes !== undefined && live.alerts !== undefined;
  if (!loaded) {
    if (slow) return { ...sample, loading: false, source: { kind: 'sample', reason: 'slow' } };
    return { vehicles: [], routes: [], alerts: [], loading: true, source: { kind: 'live' } };
  }

  return {
    vehicles: live.vehicles ?? [],
    routes: live.routes ?? [],
    alerts: live.alerts ?? [],
    loading: false,
    source: { kind: 'live' },
  };
}
