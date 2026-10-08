// Typed wrappers over the REST contract in docs/07-api.md. Screens call these, never axios directly.
// When EXPO_PUBLIC_USE_MOCK_API=true, calls are served by ./mock instead of the network.
import { env } from '@/config/env';
import { useAuth } from '@/store/auth';
import type {
  AdminOverview, AdminRoute, AdminTicketPage, AdminTrip, AdminUserPage, AdminVehicle, Arrival, AuthResult, BusQr, BusView, DelayAlert, DriverAlert, DriverOverview, NewAlert, NewStaffAccount, NewVehicle, OpsDashboard, Report, ReportType, Occupancy, PaymentSession, Role, Route, RouteDetail, ScanOutcome, Stop, Ticket, TicketPage, TicketStatus, Trip, TripPassengers, User, VehiclePosition,
} from '@/types';

import { api } from './client';
import { mockApi } from './mock';

async function get<T>(url: string, params?: object): Promise<T> {
  return (await api.get<{ data: T }>(url, { params })).data.data;
}
async function post<T>(url: string, body?: object): Promise<T> {
  return (await api.post<{ data: T }>(url, body)).data.data;
}
async function put<T>(url: string, body?: object): Promise<T> {
  return (await api.put<{ data: T }>(url, body)).data.data;
}
async function patch<T>(url: string, body?: object): Promise<T> {
  return (await api.patch<{ data: T }>(url, body)).data.data;
}

export const authApi = {
  login: (identifier: string, password: string): Promise<AuthResult> =>
    env.useMockApi ? mockApi.login(identifier, password) : post('/auth/login', { identifier, password }),
  register: (input: { name: string; email?: string; phone?: string; password: string }): Promise<AuthResult> =>
    env.useMockApi ? mockApi.register(input) : post('/auth/register', input),
  /** Bus drivers sign in with the driver code an admin issued (e.g. DRV-4K7Q2M), not an email or phone. */
  driverLogin: (driverCode: string, password: string): Promise<AuthResult> =>
    env.useMockApi ? mockApi.driverLogin(driverCode, password) : post('/driver/auth/login', { driverCode, password }),
};

export const userApi = {
  me: () => get<User>('/users/me'),
  update: (userId: number, input: Partial<Pick<User, 'name' | 'language' | 'notificationsEnabled'>>): Promise<User> =>
    env.useMockApi ? mockApi.updateUser(userId, input) : patch<User>('/users/me', input),
  registerPushToken: (token: string) => (env.useMockApi ? Promise.resolve() : put('/users/me/push-token', { token })),
};

export const routesApi = {
  search: (q?: string, mode?: string): Promise<Route[]> =>
    env.useMockApi ? mockApi.searchRoutes(q, mode) : get('/routes', { q, mode }),
  detail: (id: number): Promise<RouteDetail> => (env.useMockApi ? mockApi.getRoute(id) : get(`/routes/${id}`)),
  arrivals: (id: number, stopId: number): Promise<Arrival[]> =>
    env.useMockApi ? mockApi.getArrivals(id, stopId) : get(`/routes/${id}/arrivals`, { stopId }),
  nearbyStops: (lat: number, lng: number, radius = 1500): Promise<Stop[]> =>
    env.useMockApi ? mockApi.nearbyStops(lat, lng) : get('/stops/nearby', { lat, lng, radius }),
  vehicles: (id: number): Promise<VehiclePosition[]> =>
    env.useMockApi ? mockApi.getVehicles(id) : get(`/routes/${id}/vehicles`),
};

/** The bus behind a scanned QR sticker. Public: works before login, like route browsing. */
export const busesApi = {
  get: (code: string): Promise<BusView> => (env.useMockApi ? mockApi.getBus(code) : get(`/buses/${encodeURIComponent(code)}`)),
};

const TICKET_PAGE_SIZE = 20;

export const ticketsApi = {
  create: (input: { tripId: number; boardStopId: number; alightStopId: number }): Promise<PaymentSession> =>
    env.useMockApi ? mockApi.createTicket(input) : post('/tickets', input),
  get: (id: number): Promise<Ticket> => (env.useMockApi ? mockApi.getTicket(id) : get(`/tickets/${id}`)),
  list: async (status?: string, page = 1): Promise<TicketPage> => {
    if (env.useMockApi) return mockApi.listTickets(status, page);
    // docs/07-api.md does not fix the paging envelope; treat a full page as "there may be more"
    const items = await get<Ticket[]>('/tickets', { status, page });
    return { items, nextPage: items.length >= TICKET_PAGE_SIZE ? page + 1 : null };
  },
  cancel: (id: number): Promise<Ticket> => (env.useMockApi ? mockApi.cancelTicket(id) : post(`/tickets/${id}/cancel`)),
};

export const scansApi = {
  /** Validate by QR token or, when the QR will not scan, by typed ticket id (docs/07-api.md `POST /scans`). */
  validate: (input: { qrToken?: string; ticketId?: number }): Promise<ScanOutcome> =>
    env.useMockApi ? mockApi.scanTicket(input) : post('/scans', input),
};

export const vehiclesApi = {
  setOccupancy: (vehicleId: number, passengerCount: number): Promise<Occupancy> =>
    env.useMockApi ? mockApi.setOccupancy(vehicleId, passengerCount) : post(`/vehicles/${vehicleId}/occupancy`, { passengerCount }),
};

export const alertsApi = {
  list: (unread?: boolean): Promise<DelayAlert[]> =>
    env.useMockApi ? mockApi.getAlerts(unread) : get('/alerts', unread ? { unread: true } : undefined),
  publish: (input: NewAlert): Promise<DelayAlert> => (env.useMockApi ? mockApi.publishAlert(input) : post('/alerts', input)),
  markRead: (id: number): Promise<DelayAlert> => (env.useMockApi ? mockApi.markAlertRead(id) : patch(`/alerts/${id}/read`)),
};

// mock mode has no server session, so the mock driver panel is told who is signed in
const driverId = () => useAuth.getState().user?.userId ?? 0;

/** The driver's panel for their own bus (RideTrack-API `/driver/*`, DRIVER sessions only). */
export const driverApi = {
  me: (): Promise<DriverOverview> => (env.useMockApi ? mockApi.driverMe(driverId()) : get('/driver/me')),
  setDuty: (onDuty: boolean): Promise<{ onDuty: boolean }> =>
    env.useMockApi ? mockApi.driverSetDuty(driverId(), onDuty) : put('/driver/duty', { onDuty }),
  /** A GPS fix from this phone becomes the bus's live position. Refused (`OFF_DUTY`) unless the driver is on duty. */
  reportLocation: (fix: { lat: number; lng: number; recordedAt?: string }): Promise<void> =>
    env.useMockApi ? mockApi.driverReportLocation(driverId(), fix) : post('/driver/location', fix),
  setOccupancy: (passengerCount: number): Promise<Occupancy> =>
    env.useMockApi ? mockApi.driverSetOccupancy(driverId(), passengerCount) : put('/driver/occupancy', { passengerCount }),
  trips: (): Promise<Trip[]> => (env.useMockApi ? mockApi.driverTrips(driverId()) : get('/driver/trips')),
  /** Departing: the trip goes ONGOING and the driver goes on duty. */
  startTrip: (tripId: number): Promise<Trip> =>
    env.useMockApi ? mockApi.driverStartTrip(driverId(), tripId) : post(`/driver/trips/${tripId}/start`),
  endTrip: (tripId: number): Promise<Trip> => (env.useMockApi ? mockApi.driverEndTrip(driverId(), tripId) : post(`/driver/trips/${tripId}/end`)),
  passengers: (tripId: number): Promise<TripPassengers> =>
    env.useMockApi ? mockApi.driverTripPassengers(driverId(), tripId) : get(`/driver/trips/${tripId}/passengers`),
  raiseAlert: (input: DriverAlert): Promise<DelayAlert> => (env.useMockApi ? mockApi.driverRaiseAlert(driverId(), input) : post('/driver/alerts', input)),
  qr: (): Promise<BusQr> => (env.useMockApi ? mockApi.driverBusQr(driverId()) : get('/driver/bus/qr')),
  /** A new code for the bus: the old sticker stops working at once. */
  rotateQr: (): Promise<BusQr> => (env.useMockApi ? mockApi.driverRotateQr(driverId()) : post('/driver/bus/qr/rotate')),
  logout: (refreshToken: string): Promise<void> =>
    env.useMockApi ? Promise.resolve() : post('/driver/auth/logout', { refreshToken }),
};

/** Back office for authority officers (RideTrack-API `/admin/*`). */
export const adminApi = {
  overview: (): Promise<AdminOverview> => (env.useMockApi ? mockApi.adminOverview() : get('/admin/overview')),
  users: (filters: { q?: string; role?: Role; page: number; limit: number }): Promise<AdminUserPage> =>
    env.useMockApi ? mockApi.adminUsers(filters) : get('/admin/users', { ...filters, q: filters.q || undefined }),
  createUser: (input: NewStaffAccount): Promise<User> => (env.useMockApi ? mockApi.adminCreateUser(input) : post('/admin/users', input)),
  updateUser: (userId: number, input: { isActive?: boolean; vehicleId?: number | null }): Promise<User> =>
    env.useMockApi ? mockApi.adminUpdateUser(userId, input) : patch(`/admin/users/${userId}`, input),
  routes: (): Promise<AdminRoute[]> => (env.useMockApi ? mockApi.adminRoutes() : get('/admin/routes')),
  vehicles: (): Promise<AdminVehicle[]> => (env.useMockApi ? mockApi.adminVehicles() : get('/admin/vehicles')),
  createVehicle: (input: NewVehicle): Promise<AdminVehicle> =>
    env.useMockApi ? mockApi.adminCreateVehicle(input) : post('/admin/vehicles', input),
  updateVehicle: (vehicleId: number, input: Partial<Pick<AdminVehicle, 'regNo' | 'capacity' | 'routeId' | 'isActive'>>): Promise<AdminVehicle> =>
    env.useMockApi ? mockApi.adminUpdateVehicle(vehicleId, input) : patch(`/admin/vehicles/${vehicleId}`, input),
  /** `date` is a UTC day, YYYY-MM-DD */
  trips: (date: string, routeId?: number): Promise<AdminTrip[]> =>
    env.useMockApi ? mockApi.adminTrips(date, routeId) : get('/admin/trips', { date, routeId }),
  tickets: (filters: { status?: TicketStatus; page: number; limit: number }): Promise<AdminTicketPage> =>
    env.useMockApi ? mockApi.adminTickets(filters) : get('/admin/tickets', filters),
};

export const opsApi = {
  dashboard: (): Promise<OpsDashboard> => (env.useMockApi ? mockApi.getDashboard() : get('/ops/dashboard')),
  report: (type: ReportType, routeId: number | undefined, from: string, to: string): Promise<Report> =>
    env.useMockApi ? mockApi.getReport(type, routeId, from, to) : get('/reports', { type, routeId, from, to }),
};
