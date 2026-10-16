import type { Route, Stop } from '@/types';

/**
 * Fare from `board` to `alight`, by the same rule as the server (RideTrack-API `fareBetween`): on routes with zone fares
 * (Dubai RTA) it depends on how many fare zones the trip touches, otherwise it is the difference of the stop fares, never
 * less than the route's minimum fare (Sri Lanka buses: the NTC minimum) when it has one.
 */
export function fareBetween(route: Pick<Route, 'zoneFares' | 'minFare'>, stops: Stop[], board: Stop, alight: Stop): number {
  const leg = stops.filter((s) => s.stopSequence! >= board.stopSequence! && s.stopSequence! <= alight.stopSequence!);
  if (route.zoneFares?.length && leg.every((s) => s.fareZone)) {
    const zones = new Set(leg.map((s) => s.fareZone)).size;
    return route.zoneFares[Math.min(zones, route.zoneFares.length) - 1];
  }
  const fare = Math.round((alight.fareFromOrigin! - board.fareFromOrigin!) * 100) / 100;
  return Math.max(fare, route.minFare ?? 0);
}
