import type { TransportType } from '@/constants/transport';
import type { Route, TripResult } from '@/types/models';

import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';

/**
 * Data used by the passenger Search and Results screens. Every function takes the transport
 * type chosen at the start, so buses and trains never mix.
 *
 * TODO(Firebase): replace the bodies with Firestore queries, for example
 * query(collection(db, 'routes'), where('type', '==', transport)).
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

/** Routes between two places, in either direction. Used by the Results screen. */
export function findRoutes(transport: TransportType, from: string, to: string): Route[] {
  return sampleRoutes.filter(
    (r) =>
      r.type === transport &&
      ((matches(r.from, from) && matches(r.to, to)) || (matches(r.from, to) && matches(r.to, from))),
  );
}

/** Every scheduled trip on the routes between two places, ready for Results to filter and sort. */
export function getResults(transport: TransportType, from: string, to: string): TripResult[] {
  const routes = findRoutes(transport, from, to);
  return sampleSchedules
    .filter((s) => s.type === transport)
    .flatMap((schedule) => {
      const route = routes.find((r) => r.id === schedule.routeId);
      const vehicle = sampleVehicles.find((v) => v.id === schedule.vehicleId);
      return route ? [{ schedule, route, vehicle }] : [];
    });
}
