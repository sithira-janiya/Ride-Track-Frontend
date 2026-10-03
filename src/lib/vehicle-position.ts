import type { Stop, TripDetail } from '@/types/models';

import { toMinutes } from './format';

export type LatLng = { latitude: number; longitude: number };

/** How far along the trip it is at a time of day, from 0 (not started) to 1 (arrived). */
export function tripFraction(detail: TripDetail, nowMinutes: number): number {
  const start = toMinutes(detail.schedule.departure);
  const fraction = (nowMinutes - start) / detail.schedule.durationMinutes;
  return Math.min(1, Math.max(0, fraction));
}

/** Time of day (minutes since midnight) at a given share of the trip. */
export function minutesAtFraction(detail: TripDetail, fraction: number): number {
  return toMinutes(detail.schedule.departure) + fraction * detail.schedule.durationMinutes;
}

/**
 * Position at a share of the trip, found by moving in a straight line between the two stops
 * either side of it. Sample data has no road geometry, so this is an approximation.
 */
export function positionAt(stops: Stop[], fraction: number): LatLng {
  const f = Math.min(1, Math.max(0, fraction));
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (f >= a.at && f <= b.at) {
      const t = b.at === a.at ? 0 : (f - a.at) / (b.at - a.at);
      return {
        latitude: a.lat + (b.lat - a.lat) * t,
        longitude: a.lng + (b.lng - a.lng) * t,
      };
    }
  }
  const last = stops[stops.length - 1];
  return { latitude: last.lat, longitude: last.lng };
}

export function stopCoordinates(stops: Stop[]): LatLng[] {
  return stops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
}
