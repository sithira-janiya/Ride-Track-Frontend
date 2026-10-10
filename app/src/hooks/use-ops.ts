import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { opsApi, routesApi } from '@/api/endpoints';
import { env } from '@/config/env';
import { getSocket } from '@/socket';

/**
 * Live operations snapshot (FR9). The socket's `ops:update` tells us when to refresh;
 * a slow poll covers a dropped connection, and mock mode (no socket) polls quickly instead.
 */
export function useOpsDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['ops', 'dashboard'],
    queryFn: opsApi.dashboard,
    refetchInterval: env.useMockApi ? 4_000 : 30_000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['ops', 'dashboard'] });
    socket.on('ops:update', refresh);
    return () => {
      socket.off('ops:update', refresh);
    };
  }, [queryClient]);

  return query;
}

/** Trips that have a vehicle and are still running, listed from the route's first stop. */
export function useRouteTrips(routeId: number | null) {
  const detail = useQuery({ queryKey: ['route', routeId], queryFn: () => routesApi.detail(routeId!), enabled: routeId != null });
  const firstStopId = detail.data?.stops[0]?.stopId;
  const arrivals = useQuery({
    queryKey: ['arrivals', routeId, firstStopId],
    queryFn: () => routesApi.arrivals(routeId!, firstStopId!),
    enabled: firstStopId != null,
  });
  return {
    isPending: detail.isPending || arrivals.isPending,
    error: detail.error ?? arrivals.error,
    trips: (arrivals.data ?? []).filter((t) => t.status !== 'CANCELLED' && t.status !== 'COMPLETED'),
  };
}
