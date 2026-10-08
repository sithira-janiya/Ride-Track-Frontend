import { useQuery } from '@tanstack/react-query';

import { routesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import type { TransportMode } from '@/types';

import { isRunning } from '../arrivals';

/** Every route. Shared by favourites, the staff shift picker and the authority filters. */
export function useAllRoutes() {
  return useQuery({ queryKey: queryKeys.routes(), queryFn: () => routesApi.search() });
}

/** Route search (FR3). Pass debounced text so typing does not fire a request per keystroke. */
export function useRouteSearch(q: string, mode: TransportMode | 'ALL', enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.routes(q, mode),
    queryFn: () => routesApi.search(q, mode === 'ALL' ? undefined : mode),
    enabled,
  });
}

/** A route with its ordered stops and fares. */
export function useRouteDetail(routeId: number | null) {
  return useQuery({
    queryKey: queryKeys.route(routeId),
    queryFn: () => routesApi.detail(routeId!),
    enabled: routeId != null && Number.isFinite(routeId),
  });
}

/** Upcoming trips at one stop of a route. */
export function useArrivals(routeId: number | null, stopId: number | null | undefined, refetchInterval?: number) {
  return useQuery({
    queryKey: queryKeys.arrivals(routeId, stopId),
    queryFn: () => routesApi.arrivals(routeId!, stopId!),
    enabled: routeId != null && stopId != null,
    refetchInterval,
  });
}

/** Trips that are still running on a route, listed from its first stop (where a trip and a shift start). */
export function useRouteTrips(routeId: number | null) {
  const detail = useRouteDetail(routeId);
  const arrivals = useArrivals(routeId, detail.data?.stops[0]?.stopId);
  const error = detail.error ?? arrivals.error;
  return {
    // arrivals never start when the route fails to load, so an error ends the loading state
    isPending: !error && (detail.isPending || arrivals.isPending),
    error,
    refetch: () => (detail.isError ? detail.refetch() : arrivals.refetch()),
    trips: (arrivals.data ?? []).filter(isRunning),
  };
}
