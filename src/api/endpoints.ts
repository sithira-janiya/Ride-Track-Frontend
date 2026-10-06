// Typed wrappers over the REST contract in docs/07-api.md. Screens call these, never axios directly.
// When EXPO_PUBLIC_USE_MOCK_API=true, calls are served by ./mock instead of the network.
import { env } from '@/config/env';
import type { Arrival, AuthResult, Route, RouteDetail, Stop, Ticket, User, VehiclePosition } from '@/types';

import { api } from './client';
import { mockApi } from './mock';

async function get<T>(url: string, params?: object): Promise<T> {
  return (await api.get<{ data: T }>(url, { params })).data.data;
}
async function post<T>(url: string, body?: object): Promise<T> {
  return (await api.post<{ data: T }>(url, body)).data.data;
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
  update: (input: Partial<Pick<User, 'name' | 'language'>>) => patch<User>('/users/me', input),
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
    env.useMockApi ? mockApi.getVehicles() : get(`/routes/${id}/vehicles`),
};

export const ticketsApi = {
  list: (status?: string): Promise<Ticket[]> =>
    env.useMockApi ? mockApi.getTickets() : get('/tickets', { status }),
};
