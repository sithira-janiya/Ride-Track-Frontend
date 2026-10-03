import type { TransportType } from '@/constants/transport';
import type { Route, TripResult } from '@/types/models';

import { sampleRoutes, sampleSchedules } from '@/data/sample-data';

/**
 * Data used by the passenger Search and Results screens. Every function takes the transport
 * type chosen at the start, so buses and trains never mix.
 *
 * TODO(Firebase): replace the bodies with Firestore queries, for example
 * query(collection(db, 'routes'), where('type', '==', transport)).
 */

/** Every place a passenger can pick, for the chosen transport, sorted A to Z. */
export function getPlaces(transport: TransportType): string[] {
  const names = new Set<string>();
  sampleRoutes
    .filter((r) => r.type === transport)
    .forEach((r) => {
      names.add(r.from);
      names.add(r.to);
    });
  return [...names].sort((a, b) => a.localeCompare(b));
}

const matches = (place: string, query: string) => place.toLowerCase().includes(query.trim().toLowerCase());

/** Places that contain what the passenger typed. An empty query returns nothing. */
export function suggestPlaces(transport: TransportType, query: string, exclude?: string): string[] {
  if (!query.trim()) return [];
  return getPlaces(transport).filter((p) => matches(p, query) && p.toLowerCase() !== exclude?.trim().toLowerCase());
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
      return route ? [{ schedule, route }] : [];
    });
}
