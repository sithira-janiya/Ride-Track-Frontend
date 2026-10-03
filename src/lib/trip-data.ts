import { sampleRoutes, sampleSchedules, sampleVehicles } from '@/data/sample-data';
import type { TripDetail } from '@/types/models';

import { toClock, toMinutes } from './format';

/**
 * Data used by the Transport Details and Route & Stops screens.
 *
 * TODO(Firebase): replace the body with reads of schedules/{id}, its route and its vehicle.
 */

/** One scheduled trip with its route, vehicle and the time it reaches each stop. */
export function getTripDetail(scheduleId: string): TripDetail | undefined {
  const schedule = sampleSchedules.find((s) => s.id === scheduleId);
  if (!schedule) return undefined;
  const route = sampleRoutes.find((r) => r.id === schedule.routeId);
  const vehicle = sampleVehicles.find((v) => v.id === schedule.vehicleId);
  if (!route || !vehicle) return undefined;

  const departure = toMinutes(schedule.departure);
  const stopTimes = route.stops.map((stop) => ({
    stop,
    time: toClock(departure + Math.round(stop.at * schedule.durationMinutes)),
  }));

  return { schedule, route, vehicle, stopTimes };
}
