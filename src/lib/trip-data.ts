import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';
import type { Route, Schedule, TripDetail, Vehicle } from '@/types/models';

import { toClock, toMinutes } from './format';

/**
 * Data used by the Transport Details and Route & Stops screens. The live version is
 * src/hooks/use-trip-detail.ts; this file holds the pure logic it shares and the sample fallback.
 */

/** Puts a schedule, its route and its vehicle together with the time it reaches each stop. */
export function buildTripDetail(schedule: Schedule, route: Route, vehicle: Vehicle): TripDetail {
  const departure = toMinutes(schedule.departure);
  const stopTimes = route.stops.map((stop) => ({
    stop,
    time: toClock(departure + Math.round(stop.at * schedule.durationMinutes)),
  }));
  return { schedule, route, vehicle, stopTimes };
}

/** One sample trip, or undefined when the id is unknown. */
export function getTripDetail(scheduleId: string): TripDetail | undefined {
  const schedule = sampleSchedules.find((s) => s.id === scheduleId);
  if (!schedule) return undefined;
  const route = sampleRoutes.find((r) => r.id === schedule.routeId);
  const vehicle = sampleVehicles.find((v) => v.id === schedule.vehicleId);
  if (!route || !vehicle) return undefined;
  return buildTripDetail(schedule, route, vehicle);
}
