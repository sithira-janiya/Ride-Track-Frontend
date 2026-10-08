// Every TanStack Query key in one place, so invalidations and the offline cache list cannot drift apart.
// The first element is the key's root: `invalidateQueries({ queryKey: queryKeys.tickets.all })` refreshes every ticket list.
import type { Role, TicketStatus } from '@/types';

export const queryKeys = {
  routes: (q = '', mode = 'ALL') => ['routes', q, mode] as const,
  route: (routeId: number | null) => ['route', routeId] as const,
  arrivals: (routeId: number | null, stopId: number | null | undefined) => ['arrivals', routeId, stopId] as const,
  nearbyStops: (lat: string | undefined, lng: string | undefined) => ['nearby-stops', lat, lng] as const,
  vehicles: (routeId: number | undefined) => ['vehicles', routeId] as const,
  tickets: {
    all: ['tickets'] as const,
    list: (status?: string) => ['tickets', status ?? 'ALL'] as const,
  },
  ticket: (ticketId: number) => ['ticket', ticketId] as const,
  alerts: ['alerts'] as const,
  opsDashboard: ['ops', 'dashboard'] as const,
  report: (criteria: object | null) => ['report', criteria] as const,
  admin: {
    all: ['admin'] as const,
    overview: ['admin', 'overview'] as const,
    users: (q: string, role: Role | undefined) => ['admin', 'users', q, role ?? 'ALL'] as const,
    tickets: (status: TicketStatus | undefined) => ['admin', 'tickets', status ?? 'ALL'] as const,
    routes: ['admin', 'routes'] as const,
    vehicles: ['admin', 'vehicles'] as const,
    trips: (date: string, routeId: number | undefined) => ['admin', 'trips', date, routeId ?? 'ALL'] as const,
  },
};

/**
 * Roots of the queries saved on the device for 24 h, so routes and timetables still show without signal (like LMT GO).
 * Alerts, tickets (they have their own cache), live vehicles and admin data are never saved.
 */
export const OFFLINE_QUERY_ROOTS: readonly string[] = ['routes', 'route', 'arrivals', 'nearby-stops'];
