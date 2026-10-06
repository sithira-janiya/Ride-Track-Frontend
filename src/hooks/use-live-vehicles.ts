import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { routesApi } from '@/api/endpoints';
import { env } from '@/config/env';
import { getSocket } from '@/socket';
import type { ServerToClientEvents, VehiclePosition } from '@/types';

/** After this long without an update the UI shows the data as stale (FR4, NFR2). */
export const STALE_AFTER_MS = 60_000;

/**
 * Live vehicle positions for one route. REST gives the starting snapshot; in real mode the socket
 * then pushes `vehicle:location` / `vehicle:occupancy`. Mock mode has no socket, so it re-polls instead.
 * Subscribes on screen focus and unsubscribes on blur to save battery and data.
 */
export function useLiveVehicles(routeId: number) {
  const query = useQuery({
    queryKey: ['vehicles', routeId],
    queryFn: () => routesApi.vehicles(routeId),
    enabled: Number.isFinite(routeId),
    refetchInterval: env.useMockApi ? 3_000 : 30_000, // fallback poll if the socket drops
  });

  const [overlay, setOverlay] = useState<Record<number, Partial<VehiclePosition>>>({});
  const [connected, setConnected] = useState(env.useMockApi);
  const [lastSocketUpdate, setLastSocketUpdate] = useState(0);

  // a fresh REST snapshot supersedes any older socket updates
  const [seenSnapshot, setSeenSnapshot] = useState(query.dataUpdatedAt);
  if (seenSnapshot !== query.dataUpdatedAt) {
    setSeenSnapshot(query.dataUpdatedAt);
    setOverlay({});
  }

  useFocusEffect(
    useCallback(() => {
      const socket = getSocket();
      if (!socket || !Number.isFinite(routeId)) return;

      const subscribe = () => {
        setConnected(true);
        socket.emit('route:subscribe', { routeId }); // rooms are lost on reconnect, so re-join each time
      };
      const disconnected = () => setConnected(false);
      const onLocation: ServerToClientEvents['vehicle:location'] = (p) => {
        setOverlay((o) => ({ ...o, [p.vehicleId]: { ...o[p.vehicleId], lat: p.lat, lng: p.lng, eta: p.eta, recordedAt: p.recordedAt } }));
        setLastSocketUpdate(Date.now());
      };
      const onOccupancy: ServerToClientEvents['vehicle:occupancy'] = (p) => {
        setOverlay((o) => ({ ...o, [p.vehicleId]: { ...o[p.vehicleId], passengerCount: p.passengerCount, capacity: p.capacity } }));
        setLastSocketUpdate(Date.now());
      };

      socket.on('connect', subscribe);
      socket.on('disconnect', disconnected);
      socket.on('vehicle:location', onLocation);
      socket.on('vehicle:occupancy', onOccupancy);
      if (socket.connected) subscribe();

      return () => {
        socket.emit('route:unsubscribe', { routeId });
        socket.off('connect', subscribe);
        socket.off('disconnect', disconnected);
        socket.off('vehicle:location', onLocation);
        socket.off('vehicle:occupancy', onOccupancy);
      };
    }, [routeId]),
  );

  const vehicles = useMemo<VehiclePosition[]>(
    () => (query.data ?? []).map((v) => ({ ...v, ...overlay[v.vehicleId] })),
    [query.data, overlay],
  );

  const lastUpdated = Math.max(query.dataUpdatedAt, lastSocketUpdate) || null;

  return { vehicles, query, connected, lastUpdated };
}

/** Re-renders every `intervalMs` so "updated 12 s ago" labels stay current. */
export function useNow(intervalMs = 5_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
