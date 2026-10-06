// In-memory fake backend so screens can be built before the real API exists (see docs/11-frontend-tasks.md, Phase 0).
// Enabled by EXPO_PUBLIC_USE_MOCK_API=true. Shapes follow docs/07-api.md.
import type { Arrival, AuthResult, Route, RouteDetail, Stop, Ticket, User, VehiclePosition } from '@/types';

const delay = <T>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const minsFromNow = (m: number) => new Date(Date.now() + m * 60000).toISOString();

const allStops: Stop[] = [
  { stopId: 1, name: 'Colombo Fort', latitude: 6.9335, longitude: 79.8501 },
  { stopId: 2, name: 'Maradana', latitude: 6.9271, longitude: 79.8612 },
  { stopId: 3, name: 'Borella', latitude: 6.9147, longitude: 79.8777 },
  { stopId: 4, name: 'Nugegoda', latitude: 6.8649, longitude: 79.8997 },
  { stopId: 5, name: 'Kottawa', latitude: 6.8419, longitude: 79.9654 },
  { stopId: 6, name: 'Ragama', latitude: 7.0289, longitude: 79.9219 },
  { stopId: 7, name: 'Gampaha', latitude: 7.0873, longitude: 79.9925 },
  { stopId: 8, name: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
];

// route -> ordered [stopId, fareFromOrigin]
const routeStops: Record<number, [number, number][]> = {
  1: [[1, 0], [2, 30], [3, 50], [4, 80], [5, 120]],
  2: [[1, 0], [2, 60], [6, 140], [7, 190], [8, 520]],
};

const stopsFor = (routeId: number): Stop[] =>
  (routeStops[routeId] ?? []).map(([stopId, fare], i) => ({
    ...allStops.find((s) => s.stopId === stopId)!,
    stopSequence: i + 1,
    fareFromOrigin: fare,
  }));

const vehiclesByRoute: Record<
  number,
  { vehicleId: number; regNo: string; offsetSec: number; periodSec: number; passengerCount: number; capacity: number }[]
> = {
  1: [
    { vehicleId: 101, regNo: 'NB-1234', offsetSec: 0, periodSec: 240, passengerCount: 28, capacity: 52 },
    { vehicleId: 102, regNo: 'NB-5678', offsetSec: 120, periodSec: 240, passengerCount: 50, capacity: 52 },
  ],
  2: [{ vehicleId: 201, regNo: 'TR-0042', offsetSec: 30, periodSec: 600, passengerCount: 310, capacity: 480 }],
};

const routes: Route[] = [
  { routeId: 1, routeNo: '138', name: 'Colombo - Kottawa', mode: 'BUS', origin: 'Colombo Fort', destination: 'Kottawa' },
  { routeId: 2, routeNo: 'MAIN', name: 'Main Line - Colombo to Kandy', mode: 'TRAIN', origin: 'Colombo Fort', destination: 'Kandy' },
  { routeId: 3, routeNo: '177', name: 'Colombo - Kaduwela', mode: 'BUS', origin: 'Colombo Fort', destination: 'Kaduwela' },
];

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

const users: User[] = [
  { userId: 1, name: 'Demo Passenger', email: 'passenger@ridetrack.test', phone: null, role: 'PASSENGER', isActive: true },
  { userId: 2, name: 'Demo Conductor', email: 'staff@ridetrack.test', phone: null, role: 'STAFF', isActive: true },
  { userId: 3, name: 'Demo Officer', email: 'officer@ridetrack.test', phone: null, role: 'AUTHORITY', isActive: true },
];

/** All demo accounts use this password. Mock mode only. */
export const MOCK_PASSWORD = 'Password1!';

export const mockApi = {
  async login(identifier: string, password: string): Promise<AuthResult> {
    const user = users.find((u) => u.email === identifier || u.phone === identifier);
    // same message for unknown account and wrong password (docs/03-dfd.md, security note)
    if (!user || password !== MOCK_PASSWORD) throw new Error('Invalid email/phone or password.');
    return delay({ user, accessToken: `mock-access-${user.userId}`, refreshToken: `mock-refresh-${user.userId}` });
  },

  async register(input: { name: string; email?: string; phone?: string; password: string }): Promise<AuthResult> {
    if (users.some((u) => (input.email && u.email === input.email) || (input.phone && u.phone === input.phone))) {
      throw new Error('An account with these details already exists.');
    }
    const user: User = {
      userId: users.length + 1,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      role: 'PASSENGER',
      isActive: true,
    };
    users.push(user);
    return delay({ user, accessToken: `mock-access-${user.userId}`, refreshToken: `mock-refresh-${user.userId}` });
  },

  searchRoutes: (q = '', mode?: string): Promise<Route[]> =>
    delay(
      routes.filter(
        (r) =>
          (!mode || r.mode === mode) &&
          `${r.routeNo} ${r.name} ${r.origin} ${r.destination}`.toLowerCase().includes(q.toLowerCase()),
      ),
    ),

  getRoute(routeId: number): Promise<RouteDetail> {
    const route = routes.find((r) => r.routeId === routeId);
    if (!route) throw new Error('Route not found.');
    return delay({ ...route, stops: stopsFor(routeId) });
  },

  /** Mock ignores the radius and returns the closest stops so the list is never empty during development. */
  nearbyStops: (lat: number, lng: number, limit = 4): Promise<Stop[]> =>
    delay(
      allStops
        .map((s) => ({
          ...s,
          distanceMeters: Math.round(haversineMeters(lat, lng, s.latitude, s.longitude)),
          routeIds: Object.keys(routeStops)
            .map(Number)
            .filter((id) => routeStops[id].some(([stopId]) => stopId === s.stopId)),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit),
    ),

  getArrivals(routeId: number, stopId: number): Promise<Arrival[]> {
    // vary times by stop so switching stops visibly changes the list
    const o = stopId % 5;
    return delay([
      { tripId: routeId * 10 + 1, routeId, vehicleId: 101, eta: minsFromNow(2 + o), scheduled: false, status: 'ONGOING' },
      { tripId: routeId * 10 + 2, routeId, vehicleId: null, eta: minsFromNow(15 + o), scheduled: true, status: 'SCHEDULED' },
      { tripId: routeId * 10 + 3, routeId, vehicleId: 102, eta: minsFromNow(28 + o), scheduled: false, status: 'DELAYED' },
    ]);
  },

  /** Vehicles drift along the route over time, so polling this shows them moving. */
  getVehicles(routeId: number): Promise<VehiclePosition[]> {
    const path = stopsFor(routeId);
    if (path.length < 2) return delay([]);
    const now = Date.now();
    return delay(
      (vehiclesByRoute[routeId] ?? []).map((v) => {
        // ping-pong along the stops: 0 -> 1 -> 0 over `periodSec`
        const t = ((now / 1000 + v.offsetSec) % v.periodSec) / v.periodSec;
        const progress = t < 0.5 ? t * 2 : (1 - t) * 2;
        const scaled = progress * (path.length - 1);
        const seg = Math.min(Math.floor(scaled), path.length - 2);
        const f = scaled - seg;
        const a = path[seg];
        const b = path[seg + 1];
        return {
          vehicleId: v.vehicleId,
          regNo: v.regNo,
          lat: a.latitude + (b.latitude - a.latitude) * f,
          lng: a.longitude + (b.longitude - a.longitude) * f,
          eta: new Date(now + (1 - progress) * v.periodSec * 500).toISOString(),
          recordedAt: new Date(now).toISOString(),
          passengerCount: v.passengerCount,
          capacity: v.capacity,
        };
      }),
    );
  },

  getTickets: (): Promise<Ticket[]> => delay([]),
};
