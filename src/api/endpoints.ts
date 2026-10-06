// Typed wrappers over the REST contract in docs/07-api.md. Screens call these, never axios directly.
// When EXPO_PUBLIC_USE_MOCK_API=true, calls are served by ./mock instead of the network.
import { env } from '@/config/env';
import type { Arrival, AuthResult, DelayAlert, Occupancy, PaymentSession, Route, RouteDetail, ScanOutcome, Stop, Ticket, TicketPage, User, VehiclePosition } from '@/types';

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
  markRead: (id: number): Promise<DelayAlert> => (env.useMockApi ? mockApi.markAlertRead(id) : patch(`/alerts/${id}/read`)),
};
