import type { TransportType } from '@/constants/transport';
import type { Alert, Route, Vehicle } from '@/types/models';

import { sampleAlerts, sampleRoutes, sampleVehicles } from '@/data/sample-data';

/**
 * Data used by the passenger Home screen. Every function takes the transport type chosen at the
 * start, so Home only ever shows buses or only trains.
 *
 * TODO(Firebase): replace the bodies with Firestore queries, for example
 * query(collection(db, 'vehicles'), where('type', '==', transport)).
 */

export function getNearbyVehicles(transport: TransportType): Vehicle[] {
  return sampleVehicles.filter((v) => v.type === transport).sort((a, b) => a.etaMinutes - b.etaMinutes);
}

export function getPopularRoutes(transport: TransportType): Route[] {
  return sampleRoutes.filter((r) => r.type === transport);
}

export function getRoutesByIds(transport: TransportType, ids: string[]): Route[] {
  return sampleRoutes.filter((r) => r.type === transport && ids.includes(r.id));
}

/** Alerts for the chosen transport plus alerts that apply to everyone, newest first. */
export function getAlerts(transport: TransportType): Alert[] {
  return sampleAlerts.filter((a) => a.type === null || a.type === transport).sort((a, b) => a.minutesAgo - b.minutesAgo);
}
