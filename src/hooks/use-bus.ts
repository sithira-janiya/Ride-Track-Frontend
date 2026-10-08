import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { errorCode } from '@/api/client';
import { busesApi } from '@/api/endpoints';
import { env } from '@/config/env';
import { getSocket } from '@/socket';
import { usePendingBus } from '@/store/pending-bus';
import type { ServerToClientEvents, VehiclePosition } from '@/types';
import { busCodeFromReferrer } from '@/utils/bus-code';

/**
 * A scanned bus, kept live. `GET /buses/:code` is public, so this works before login: it polls, since the socket needs a
 * session. Signed in (real mode), the route's socket room also pushes the bus's position as the driver's phone sends it.
 */
export function useBus(code: string) {
  const query = useQuery({
    queryKey: ['bus', code],
    queryFn: () => busesApi.get(code),
    enabled: code.length > 0,
    // the driver's phone reports every few seconds; an unknown code will not start working, so stop asking
    refetchInterval: (q) => (errorCode(q.state.error) === 'BUS_NOT_FOUND' ? false : env.useMockApi ? 3_000 : 10_000),
    retry: (failures, e) => errorCode(e) !== 'BUS_NOT_FOUND' && failures < 1,
  });
  const vehicleId = query.data?.bus.vehicleId;
  const routeId = query.data?.route.routeId;

  const [pushed, setPushed] = useState<Partial<VehiclePosition> | null>(null);
  // a fresh REST snapshot supersedes older socket updates
  const [seenSnapshot, setSeenSnapshot] = useState(query.dataUpdatedAt);
  if (seenSnapshot !== query.dataUpdatedAt) {
    setSeenSnapshot(query.dataUpdatedAt);
    setPushed(null);
  }

  useFocusEffect(
    useCallback(() => {
      const socket = getSocket();
      if (!socket || routeId == null || vehicleId == null) return;
      const subscribe = () => socket.emit('route:subscribe', { routeId });
      const onLocation: ServerToClientEvents['vehicle:location'] = (p) => {
        if (p.vehicleId !== vehicleId) return;
        setPushed((o) => ({ ...o, lat: p.lat, lng: p.lng, eta: p.eta, recordedAt: p.recordedAt }));
      };
      const onOccupancy: ServerToClientEvents['vehicle:occupancy'] = (p) => {
        if (p.vehicleId !== vehicleId) return;
        setPushed((o) => ({ ...o, passengerCount: p.passengerCount, capacity: p.capacity }));
      };
      socket.on('connect', subscribe);
      socket.on('vehicle:location', onLocation);
      socket.on('vehicle:occupancy', onOccupancy);
      if (socket.connected) subscribe();
      return () => {
        socket.emit('route:unsubscribe', { routeId });
        socket.off('connect', subscribe);
        socket.off('vehicle:location', onLocation);
        socket.off('vehicle:occupancy', onOccupancy);
      };
    }, [routeId, vehicleId]),
  );

  const live = useMemo<VehiclePosition | null>(() => {
    const base = query.data?.live;
    if (!base && pushed?.lat == null) return null; // the bus has never reported a position
    return { vehicleId: vehicleId!, regNo: query.data?.bus.regNo, eta: null, recordedAt: '', lat: 0, lng: 0, ...base, ...pushed };
  }, [query.data, pushed, vehicleId]);

  return { query, live };
}

const REFERRER_KEY = 'ridetrack.install-referrer-read';

/**
 * Android: a passenger who scanned a bus before installing comes back through the Play Store with `bus=<code>` as the
 * install referrer (RideTrack-API's `/b/:code` page adds it). On first launch, that bus is queued to open.
 */
export function useInstallReferrerBus() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    (async () => {
      if (await AsyncStorage.getItem(REFERRER_KEY)) return;
      // the referrer never changes after install, so it is read once, whatever it holds
      await AsyncStorage.setItem(REFERRER_KEY, new Date().toISOString());
      const code = busCodeFromReferrer(await Application.getInstallReferrerAsync());
      if (code && !cancelled) usePendingBus.getState().open(code);
    })().catch(() => {
      // no Play Store (emulator, sideloaded build): there is no referrer to read
    });
    return () => {
      cancelled = true;
    };
  }, []);
}

/**
 * Opens a bus waiting in usePendingBus. Used by the signed-out screens (which open it straight away, unless it is waiting
 * for a login) and the passenger screens (which open any).
 */
export function useOpenPendingBus(scope: 'signed-out' | 'passenger') {
  const router = useRouter();
  const code = usePendingBus((s) => (scope === 'passenger' || !s.afterLogin ? s.code : null));
  useEffect(() => {
    if (!code) return;
    usePendingBus.getState().clear();
    router.push({ pathname: '/bus/[code]', params: { code } });
  }, [code, router]);
}
