// Dubai in mock mode: real RTA stops, fare zones, running times and timetables (the same file RideTrack-API's seed
// loads, built by its scripts/import-dubai-gtfs.js from RTA's GTFS feed). Trips are worked out from the timetable on
// the fly. Route and stop ids start at 1000 so they never clash with the Colombo demo data.
import type { AdminTrip, AdminVehicle, Arrival, Route, Stop, TripStatus, VehiclePosition } from '@/types';
import { fareBetween } from '@/utils/fare';

import data from './mock-data/dubai-rta.json';

const ID_BASE = 1000;
const TRIP_BASE = 1e7; // trip id = route id * 1e7 + start minute (mod 1e7), so the route can be read back from it
const VEHICLE_BASE = 100000;
const DAY_MS = 86400000;
const TURNAROUND_MS = 5 * 60000;
const TIME_ZONE = 'Asia/Dubai';
const ZONE_FARES = [3, 5, 7.5];

export const dubaiRoutes: Route[] = data.routes.map((r, i) => ({
  routeId: ID_BASE + i,
  routeNo: r.routeNo,
  name: r.name,
  mode: r.mode as Route['mode'],
  origin: r.origin,
  destination: r.destination,
  region: 'DUBAI',
  timeZone: TIME_ZONE,
  currency: 'AED',
  zoneFares: ZONE_FARES,
}));

export const dubaiStops: Stop[] = data.stops.map((s, i) => ({ stopId: ID_BASE + i, name: s.name, latitude: s.lat, longitude: s.lng, fareZone: s.zone }));

const raw = (routeId: number) => data.routes[routeId - ID_BASE];
export const isDubaiRoute = (routeId: number) => raw(routeId) !== undefined;
export const isDubaiTrip = (tripId: number) => tripId >= TRIP_BASE * ID_BASE;
export const dubaiTripRoute = (tripId: number) => Math.floor(tripId / TRIP_BASE);

/** Ordered stops of a Dubai route, with the zone fare from the first stop and the timetabled running time. */
export function dubaiStopsFor(routeId: number): Stop[] {
  const stops: Stop[] = raw(routeId).stops.map(([i, seconds], k) => ({ ...dubaiStops[i], stopSequence: k + 1, secondsFromOrigin: seconds }));
  return stops.map((s, k) => ({ ...s, fareFromOrigin: k === 0 ? 0 : fareBetween(dubaiRoutes[0], stops, stops[0], s) }));
}

export const dubaiRoutesAtStop = (stopId: number) =>
  data.routes.flatMap((r, i) => (r.stops.some(([s]) => ID_BASE + s === stopId) ? [ID_BASE + i] : []));

export function dubaiFleet(routeId: number): Omit<AdminVehicle, 'routeNo' | 'isActive'>[] {
  const r = raw(routeId);
  return Array.from({ length: r.fleet }, (_, n) => ({
    vehicleId: VEHICLE_BASE + (routeId - ID_BASE) * 100 + n + 1,
    regNo: `${r.regPrefix}-${String(n + 1).padStart(2, '0')}`,
    type: r.mode as Route['mode'],
    capacity: r.capacity,
    routeId,
  }));
}

type Trip = { tripId: number; routeId: number; vehicleId: number; start: number; end: number };

/** Dubai's calendar date (YYYY-MM-DD) and midnight for an instant. Dubai is UTC+4 all year (no daylight saving). */
const dubaiDate = (ms: number) => new Date(ms + 4 * 3600000).toISOString().slice(0, 10);
const dubaiMidnight = (date: string) => Date.parse(`${date}T00:00:00Z`) - 4 * 3600000;

/** Trips of a route starting in [from, to), from its timetable, each given a free vehicle (as the server does). */
export function dubaiTrips(routeId: number, from: number, to: number): Trip[] {
  const r = raw(routeId);
  const durationMs = r.stops.at(-1)![1] * 1000;
  const fleet = dubaiFleet(routeId).map((v) => ({ id: v.vehicleId, freeAt: -Infinity }));
  const out: Trip[] = [];
  // start a day early: departures after midnight belong to the previous service day; vehicles are assigned from there too
  for (let day = dubaiDate(from - DAY_MS); dubaiMidnight(day) < to; day = dubaiDate(dubaiMidnight(day) + DAY_MS + 3600000)) {
    const weekday = (new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7; // 0 = Monday
    const starts = r.departures.filter((d) => d.days[weekday] === '1').flatMap((d) => d.times).sort((a, b) => a - b);
    for (const minute of starts) {
      const start = dubaiMidnight(day) + minute * 60000;
      if (start >= to) break;
      const vehicle = fleet.find((v) => v.freeAt <= start) ?? fleet.reduce((a, b) => (a.freeAt <= b.freeAt ? a : b));
      vehicle.freeAt = start + durationMs + TURNAROUND_MS;
      if (start >= from) out.push({ tripId: routeId * TRIP_BASE + ((start / 60000) % TRIP_BASE), routeId, vehicleId: vehicle.id, start, end: start + durationMs });
    }
  }
  return out;
}

const statusAt = (t: Trip, now: number): TripStatus => (t.end <= now ? 'COMPLETED' : t.start <= now ? 'ONGOING' : 'SCHEDULED');

/** Next trips at a stop, soonest first: departure plus the timetabled running time to that stop. */
export function dubaiArrivals(routeId: number, stopId: number, now = Date.now()): Arrival[] {
  const stop = dubaiStopsFor(routeId).find((s) => s.stopId === stopId);
  if (!stop) throw new Error('That stop is not on this route.');
  const offsetMs = stop.secondsFromOrigin! * 1000;
  return dubaiTrips(routeId, now - 6 * 3600000, now + 12 * 3600000)
    .filter((t) => t.start + offsetMs >= now - 60000)
    .slice(0, 10)
    .map((t) => ({ tripId: t.tripId, routeId, vehicleId: t.vehicleId, eta: new Date(t.start + offsetMs).toISOString(), scheduled: true, status: statusAt(t, now) }));
}

/** Passenger counts staff have set on Dubai vehicles in this session. */
export const dubaiOccupancy = new Map<number, number>();

/** Vehicles on the road now, where the timetable puts them, with the time to their next stop. */
export function dubaiVehicles(routeId: number, now = Date.now()): VehiclePosition[] {
  const stops = dubaiStopsFor(routeId);
  const fleet = new Map(dubaiFleet(routeId).map((v) => [v.vehicleId, v]));
  return dubaiTrips(routeId, now - DAY_MS, now + 1)
    .filter((t) => t.start <= now && now < t.end)
    .map((t) => {
      const elapsed = (now - t.start) / 1000;
      const next = Math.max(1, stops.findIndex((s) => s.secondsFromOrigin! > elapsed));
      const a = stops[next - 1];
      const b = stops[next];
      const f = (elapsed - a.secondsFromOrigin!) / (b.secondsFromOrigin! - a.secondsFromOrigin! || 1);
      const v = fleet.get(t.vehicleId)!;
      return {
        vehicleId: v.vehicleId,
        regNo: v.regNo,
        lat: a.latitude + (b.latitude - a.latitude) * f,
        lng: a.longitude + (b.longitude - a.longitude) * f,
        eta: new Date(t.start + b.secondsFromOrigin! * 1000).toISOString(),
        recordedAt: new Date(now).toISOString(),
        passengerCount: dubaiOccupancy.get(v.vehicleId) ?? Math.round(v.capacity * (0.15 + ((t.tripId % 7) / 10))),
        capacity: v.capacity,
      };
    });
}

/** Admin trips list for one UTC day. */
export function dubaiAdminTrips(date: string, routeId: number | undefined, now = Date.now()): AdminTrip[] {
  const from = Date.parse(`${date}T00:00:00Z`);
  return dubaiRoutes
    .filter((r) => !routeId || r.routeId === routeId)
    .flatMap((r) => {
      const regNo = new Map(dubaiFleet(r.routeId).map((v) => [v.vehicleId, v.regNo]));
      return dubaiTrips(r.routeId, from, from + DAY_MS).map((t) => ({
        tripId: t.tripId,
        routeId: r.routeId,
        routeNo: r.routeNo,
        vehicleId: t.vehicleId,
        regNo: regNo.get(t.vehicleId)!,
        startTime: new Date(t.start).toISOString(),
        endTime: new Date(t.end).toISOString(),
        timeZone: TIME_ZONE,
        status: statusAt(t, now),
        tickets: 0,
      }));
    });
}
