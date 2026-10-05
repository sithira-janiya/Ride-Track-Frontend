// In-memory fake backend so screens can be built before the real API exists (see docs/11-frontend-tasks.md, Phase 0).
// Enabled by EXPO_PUBLIC_USE_MOCK_API=true. Shapes follow docs/07-api.md.
import type { Arrival, AuthResult, Route, RouteDetail, Stop, Ticket, User, VehiclePosition } from '@/types';

const delay = <T>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const minsFromNow = (m: number) => new Date(Date.now() + m * 60000).toISOString();

const stops: Stop[] = [
  { stopId: 1, name: 'Colombo Fort', latitude: 6.9335, longitude: 79.8501, stopSequence: 1, fareFromOrigin: 0 },
  { stopId: 2, name: 'Maradana', latitude: 6.9271, longitude: 79.8612, stopSequence: 2, fareFromOrigin: 30 },
  { stopId: 3, name: 'Borella', latitude: 6.9147, longitude: 79.8777, stopSequence: 3, fareFromOrigin: 50 },
  { stopId: 4, name: 'Nugegoda', latitude: 6.8649, longitude: 79.8997, stopSequence: 4, fareFromOrigin: 80 },
  { stopId: 5, name: 'Kottawa', latitude: 6.8419, longitude: 79.9654, stopSequence: 5, fareFromOrigin: 120 },
];

const routes: Route[] = [
  { routeId: 1, routeNo: '138', name: 'Colombo - Kottawa', mode: 'BUS', origin: 'Colombo Fort', destination: 'Kottawa' },
  { routeId: 2, routeNo: 'MAIN', name: 'Main Line - Colombo to Kandy', mode: 'TRAIN', origin: 'Colombo Fort', destination: 'Kandy' },
];

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
    return delay({ ...route, stops });
  },

  getArrivals: (routeId: number): Promise<Arrival[]> =>
    delay([
      { tripId: 11, routeId, vehicleId: 101, eta: minsFromNow(4), scheduled: false, status: 'ONGOING' },
      { tripId: 12, routeId, vehicleId: null, eta: minsFromNow(18), scheduled: true, status: 'SCHEDULED' },
      { tripId: 13, routeId, vehicleId: 102, eta: minsFromNow(31), scheduled: false, status: 'DELAYED' },
    ]),

  getVehicles: (): Promise<VehiclePosition[]> =>
    delay([
      { vehicleId: 101, regNo: 'NB-1234', lat: 6.9, lng: 79.87, eta: minsFromNow(4), recordedAt: new Date().toISOString(), passengerCount: 28, capacity: 52 },
      { vehicleId: 102, regNo: 'NB-5678', lat: 6.86, lng: 79.91, eta: minsFromNow(31), recordedAt: new Date().toISOString(), passengerCount: 50, capacity: 52 },
    ]),

  getTickets: (): Promise<Ticket[]> => delay([]),
};
