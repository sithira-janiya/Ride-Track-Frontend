import type { TransportType } from '@/constants/transport';
import type { Route, Schedule, TripResult, Vehicle } from '@/types/models';

import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';

/**
 * Data used by the passenger Search and Results screens. Every function takes the transport
 * type chosen at the start, so buses and trains never mix.
 * The live versions are in src/hooks (use-places, use-results); these functions are the pure
 * logic they share and the sample-data fallback.
 */

/** Every place the given routes start or end at, without duplicates, sorted A to Z. */
export function placesFromRoutes(routes: Route[]): string[] {
  const names = new Set<string>();
  routes.forEach((r) => {
    if (r.from) names.add(r.from);
    if (r.to) names.add(r.to);
  });
  return [...names].sort((a, b) => a.localeCompare(b));
}

/** Sample places for the chosen transport. Used until (or instead of) live Firestore routes. */
export function getPlaces(transport: TransportType): string[] {
  return placesFromRoutes(sampleRoutes.filter((r) => r.type === transport));
}

const matches = (place: string, query: string) => place.toLowerCase().includes(query.trim().toLowerCase());

/** Places that contain what the passenger typed. An empty query returns nothing. */
export function suggestPlaces(places: string[], query: string, exclude?: string): string[] {
  if (!query.trim()) return [];
  return places.filter((p) => matches(p, query) && p.toLowerCase() !== exclude?.trim().toLowerCase());
}

/** The routes (from a list) that run between two places, in either direction. */
export function routesBetween(routes: Route[], from: string, to: string): Route[] {
  return routes.filter(
    (r) => (matches(r.from, from) && matches(r.to, to)) || (matches(r.from, to) && matches(r.to, from)),
  );
}

/** Pairs every schedule with its route (only routes between the two places) and its vehicle. */
export function buildResults(
  routes: Route[],
  schedules: Schedule[],
  vehicles: Vehicle[],
  from: string,
  to: string,
): TripResult[] {
  const between = routesBetween(routes, from, to);
  return schedules.flatMap((schedule) => {
    const route = between.find((r) => r.id === schedule.routeId);
    const vehicle = vehicles.find((v) => v.id === schedule.vehicleId);
    return route ? [{ schedule, route, vehicle }] : [];
  });
}

/** Sample trips between two places, for the chosen transport. Used until (or instead of) live data. */
export function getResults(transport: TransportType, from: string, to: string): TripResult[] {
  return buildResults(
    sampleRoutes.filter((r) => r.type === transport),
    sampleSchedules.filter((s) => s.type === transport),
    sampleVehicles,
    from,
    to,
  );
}
