// In-memory fake backend so screens can be built before the real API exists (see docs/11-frontend-tasks.md, Phase 0).
// Enabled by EXPO_PUBLIC_USE_MOCK_API=true. Shapes follow docs/07-api.md.
import type {
  AdminOverview, AdminRoute, AdminTicketPage, AdminTrip, AdminUser, AdminUserPage, AdminVehicle, Arrival, AuthResult, DelayAlert, FleetVehicle, NewAlert, NewStaffAccount, NewVehicle, Occupancy, OpsDashboard, Report, ReportType, PaymentSession, Role, Route, RouteDetail, ScanOutcome, Stop, Ticket, TicketPage, TicketStatus, TripStatus, User, VehiclePosition,
} from '@/types';
import { env } from '@/config/env';
import { fareBetween } from '@/utils/fare';

import {
  dubaiAdminTrips, dubaiArrivals, dubaiFleet, dubaiOccupancy, dubaiRoutes, dubaiRoutesAtStop, dubaiStops, dubaiStopsFor, dubaiTripRoute, dubaiVehicles, isDubaiRoute, isDubaiTrip,
} from './mock-dubai';
import { sriLankaRoutes, sriLankaRouteStops as routeStops, sriLankaStops as allStops, sriLankaVehicles as vehiclesByRoute } from './mock-sri-lanka';

/** Dubai is left out of the data entirely unless this build shows it (EXPO_PUBLIC_REGIONS). */
const dubaiOn = env.regions.includes('DUBAI');

const delay = <T>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const minsFromNow = (m: number) => new Date(Date.now() + m * 60000).toISOString();

const stopsFor = (routeId: number): Stop[] =>
  (routeStops[routeId] ?? []).map(([stopId, fare], i) => ({
    ...allStops.find((s) => s.stopId === stopId)!,
    stopSequence: i + 1,
    fareFromOrigin: fare,
  }));

const TICKET_PAGE_SIZE = 8;
let nextTicketId = 100;
// a longer history so pagination is visible in mock mode
const tickets: Ticket[] = Array.from({ length: 12 }, (_, i): Ticket => {
  const status: TicketStatus = i % 5 === 4 ? 'CANCELLED' : 'USED';
  return {
    ticketId: 99 - i,
    tripId: 11,
    boardStopId: 9,
    alightStopId: 4,
    fare: 55,
    currency: 'LKR',
    timeZone: 'Asia/Colombo',
    status,
    qrToken: null,
    issuedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    paymentStatus: status === 'CANCELLED' ? 'REFUNDED' : 'PAID',
    routeNo: '138',
    boardStopName: 'Pettah (Central Bus Stand)',
    alightStopName: 'Nugegoda',
  };
});

const routes: Route[] = [...sriLankaRoutes, ...(dubaiOn ? dubaiRoutes : [])];
const routeStopsOf = (routeId: number) => (isDubaiRoute(routeId) ? dubaiStopsFor(routeId) : stopsFor(routeId));
// Sri Lanka demo trips are routeId * 10 + n; Dubai trip ids carry their route id (see mock-dubai.ts)
const tripRouteId = (tripId: number) => (isDubaiTrip(tripId) ? dubaiTripRoute(tripId) : Math.floor(tripId / 10));

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

const users: User[] = [
  { userId: 1, name: 'Nimal Perera', email: 'passenger@ridetrack.test', phone: null, role: 'PASSENGER', isActive: true },
  { userId: 2, name: 'Sunil Fernando', email: 'staff@ridetrack.test', phone: null, role: 'STAFF', isActive: true },
  { userId: 3, name: 'Dilani Jayasinghe', email: 'officer@ridetrack.test', phone: null, role: 'AUTHORITY', isActive: true },
  { userId: 4, name: 'Ruwan Bandara', email: 'inspector@ridetrack.test', phone: null, role: 'STAFF', isActive: true },
  // logs in with a mobile number instead of an email
  { userId: 5, name: 'Kavitha Rajendran', email: null, phone: '0771234567', role: 'PASSENGER', isActive: true },
];

// admin-only details per account: staff and officer profile rows, and passwords set by an officer
type AccountInfo = Pick<AdminUser, 'createdAt' | 'employeeNo' | 'organisation' | 'staffType' | 'vehicleId'>;
const accountInfo: Record<number, AccountInfo> = {
  2: { createdAt: null, employeeNo: 'C-1001', organisation: 'SLTB Maharagama Depot', staffType: 'CONDUCTOR', vehicleId: 101 },
  3: { createdAt: null, employeeNo: 'A-2001', organisation: 'National Transport Commission', staffType: null, vehicleId: null },
  4: { createdAt: null, employeeNo: 'I-1001', organisation: 'SLTB Maharagama Depot', staffType: 'INSPECTOR', vehicleId: null },
};
const passwords: Record<number, string> = {};

const adminVehicles: AdminVehicle[] = [
  ...Object.entries(vehiclesByRoute).flatMap(([routeId, list]) => {
    const route = routes.find((r) => r.routeId === Number(routeId))!;
    return list.map((v) => ({ vehicleId: v.vehicleId, regNo: v.regNo, type: route.mode, capacity: v.capacity, routeId: route.routeId, routeNo: route.routeNo, isActive: true, operator: v.operator }));
  }),
  ...(dubaiOn ? dubaiRoutes : []).flatMap((r) => dubaiFleet(r.routeId).map((v) => ({ ...v, routeNo: r.routeNo, isActive: true }))),
];

const utcDay = (d: Date) => d.toISOString().slice(0, 10);

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const alerts: DelayAlert[] = [
  { alertId: 3, tripId: 11, type: 'DELAY', message: 'Route 138 is running about 12 minutes late because of traffic near Nugegoda.', delayMinutes: 12, createdAt: hoursAgo(0.5), isRead: false },
  { alertId: 2, tripId: 21, type: 'ROUTE_CHANGE', message: 'Main Line trains will skip Maradana until further notice.', delayMinutes: null, createdAt: hoursAgo(5), isRead: false },
  { alertId: 1, tripId: 13, type: 'CANCELLATION', message: 'The 8:08 AM trip on route 138 is cancelled.', delayMinutes: null, createdAt: hoursAgo(26), isRead: true },
];
let nextAlertId = 4;

/** All demo accounts use this password. Mock mode only. */
export const MOCK_PASSWORD = 'Password1!';

export const mockApi = {
  async login(identifier: string, password: string): Promise<AuthResult> {
    const user = users.find((u) => u.email === identifier || u.phone === identifier);
    // same message for unknown account, wrong password and disabled account (docs/03-dfd.md, security note)
    if (!user || password !== (passwords[user.userId] ?? MOCK_PASSWORD) || !user.isActive) throw new Error('Invalid email/phone or password.');
    return delay({ user, accessToken: `mock-access-${user.userId}`, refreshToken: `mock-refresh-${user.userId}` });
  },

  async register(input: { name: string; email?: string; phone?: string; password: string }): Promise<AuthResult> {
    if (users.some((u) => (input.email && u.email === input.email) || (input.phone && u.phone === input.phone))) {
      throw new Error('An account with these details already exists.');
    }
    const user: User = {
      userId: Math.max(...users.map((u) => u.userId)) + 1,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      role: 'PASSENGER',
      isActive: true,
    };
    users.push(user);
    return delay({ user, accessToken: `mock-access-${user.userId}`, refreshToken: `mock-refresh-${user.userId}` });
  },

  searchRoutes: (q = '', mode?: string, region?: string): Promise<Route[]> =>
    delay(
      routes.filter(
        (r) =>
          (!mode || r.mode === mode) &&
          (!region || r.region === region) &&
          `${r.routeNo} ${r.name} ${r.origin} ${r.destination}`.toLowerCase().includes(q.toLowerCase()),
      ),
    ),

  getRoute(routeId: number): Promise<RouteDetail> {
    const route = routes.find((r) => r.routeId === routeId);
    if (!route) throw new Error('Route not found.');
    return delay({ ...route, stops: routeStopsOf(routeId) });
  },

  /** Mock ignores the radius and returns the closest stops so the list is never empty during development. */
  nearbyStops: (lat: number, lng: number, limit = 4): Promise<Stop[]> =>
    delay(
      [...allStops, ...(dubaiOn ? dubaiStops : [])]
        .map((s) => ({
          ...s,
          distanceMeters: Math.round(haversineMeters(lat, lng, s.latitude, s.longitude)),
          routeIds:
            s.stopId >= 1000
              ? dubaiRoutesAtStop(s.stopId)
              : Object.keys(routeStops)
                  .map(Number)
                  .filter((id) => routeStops[id].some(([stopId]) => stopId === s.stopId)),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit),
    ),

  getArrivals(routeId: number, stopId: number): Promise<Arrival[]> {
    if (isDubaiRoute(routeId)) return delay(dubaiArrivals(routeId, stopId)); // from the real timetable
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
    if (isDubaiRoute(routeId)) return delay(dubaiVehicles(routeId));
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
          operator: v.operator,
        };
      }),
    );
  },

  async createTicket(input: { tripId: number; boardStopId: number; alightStopId: number }): Promise<PaymentSession> {
    const route = routes.find((r) => r.routeId === tripRouteId(input.tripId));
    const path = route ? routeStopsOf(route.routeId) : [];
    const board = path.find((s) => s.stopId === input.boardStopId);
    const alight = path.find((s) => s.stopId === input.alightStopId);
    if (!route || !board || !alight || alight.stopSequence! <= board.stopSequence!) throw new Error('Choose a drop-off stop after your boarding stop.');
    const ticket: Ticket = {
      ticketId: nextTicketId++,
      tripId: input.tripId,
      boardStopId: board.stopId,
      alightStopId: alight.stopId,
      fare: fareBetween(route, path, board, alight),
      currency: route.currency,
      timeZone: route.timeZone,
      status: 'PENDING',
      qrToken: null,
      issuedAt: new Date().toISOString(),
      paymentStatus: 'PENDING',
      routeNo: route.routeNo,
      boardStopName: board.name,
      alightStopName: alight.name,
    };
    tickets.unshift(ticket);
    return delay({ ticketId: ticket.ticketId, paymentUrl: null });
  },

  /** Stands in for the payment gateway webhook: marks the ticket paid and issues its QR token. */
  async confirmPayment(ticketId: number): Promise<void> {
    const t = tickets.find((x) => x.ticketId === ticketId);
    if (t && t.status === 'PENDING') {
      t.status = 'ACTIVE';
      t.paymentStatus = 'PAID';
      t.qrToken = `mock-qr-${t.ticketId}-${t.tripId}`;
    }
    return delay(undefined, 800);
  },

  /** Validates a ticket and, when valid, marks it used so a second scan is rejected. */
  async scanTicket(input: { qrToken?: string; ticketId?: number }): Promise<ScanOutcome> {
    const t = input.qrToken ? tickets.find((x) => x.qrToken === input.qrToken) : tickets.find((x) => x.ticketId === input.ticketId);
    if (!t) return delay({ result: 'INVALID', reason: 'Ticket not found. This is not a RideTrack ticket.' }, 400);
    const reasons: Partial<Record<TicketStatus, string>> = {
      PENDING: 'Payment has not been completed.',
      USED: 'This ticket has already been scanned.',
      EXPIRED: 'This ticket has expired.',
      CANCELLED: 'This ticket was cancelled.',
    };
    if (t.status !== 'ACTIVE') return delay({ result: 'INVALID', reason: reasons[t.status] }, 400);
    t.status = 'USED';
    return delay({ result: 'VALID' }, 400);
  },

  async setOccupancy(vehicleId: number, passengerCount: number): Promise<Occupancy> {
    const dubai = adminVehicles.find((v) => v.vehicleId === vehicleId && isDubaiRoute(v.routeId));
    if (dubai) {
      dubaiOccupancy.set(vehicleId, Math.max(0, Math.min(passengerCount, dubai.capacity)));
      return delay({ vehicleId, passengerCount: dubaiOccupancy.get(vehicleId)!, capacity: dubai.capacity });
    }
    for (const list of Object.values(vehiclesByRoute)) {
      const v = list.find((x) => x.vehicleId === vehicleId);
      if (v) {
        v.passengerCount = Math.max(0, Math.min(passengerCount, v.capacity));
        return delay({ vehicleId, passengerCount: v.passengerCount, capacity: v.capacity });
      }
    }
    throw new Error('Vehicle not found.');
  },

  getAlerts: (unread?: boolean): Promise<DelayAlert[]> => delay(alerts.filter((a) => !unread || !a.isRead).map((a) => ({ ...a }))),

  async markAlertRead(alertId: number): Promise<DelayAlert> {
    const a = alerts.find((x) => x.alertId === alertId);
    if (!a) throw new Error('Alert not found.');
    a.isRead = true;
    return delay({ ...a }, 150);
  },

  /** Demo only: stands in for the server pushing `alert:new`. */
  createDemoAlert(): DelayAlert {
    const a: DelayAlert = {
      alertId: nextAlertId++,
      tripId: 11,
      type: 'DELAY',
      message: 'Route 138 is running about 8 minutes late.',
      delayMinutes: 8,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    alerts.unshift(a);
    return { ...a };
  },

  async updateUser(userId: number, input: Partial<Pick<User, 'name' | 'language' | 'notificationsEnabled'>>): Promise<User> {
    const u = users.find((x) => x.userId === userId);
    if (!u) throw new Error('Account not found.');
    Object.assign(u, input);
    return delay({ ...u });
  },

  async getDashboard(): Promise<OpsDashboard> {
    const routeIds = routes.map((r) => r.routeId);
    const perRoute = await Promise.all(routeIds.map((id) => mockApi.getVehicles(id)));
    const vehicles: FleetVehicle[] = perRoute.flatMap((list, i) => {
      const route = routes.find((r) => r.routeId === routeIds[i])!;
      return list.map((v) => ({ ...v, routeId: route.routeId, routeNo: route.routeNo, mode: route.mode, region: route.region }));
    });
    const totalPassengers = vehicles.reduce((n, v) => n + (v.passengerCount ?? 0), 0);
    const totalCapacity = vehicles.reduce((n, v) => n + (v.capacity ?? 0), 0);
    const fullVehicles = vehicles.filter((v) => v.capacity && (v.passengerCount ?? 0) / v.capacity >= 0.9).length;
    const activeDelays = alerts.filter((a) => a.type !== 'ROUTE_CHANGE' && Date.now() - new Date(a.createdAt).getTime() < 12 * 3600000);
    return { vehicles, activeDelays: activeDelays.map((a) => ({ ...a })), occupancy: { totalPassengers, totalCapacity, fullVehicles } };
  },

  /** Deterministic fake numbers, so the same filters always give the same report. */
  async getReport(type: ReportType, routeId: number | undefined, from: string, to: string): Promise<Report> {
    const seed = (key: string) => {
      let h = 0;
      for (const ch of `${type}|${key}|${from}|${to}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return (n: number) => ((h = (h * 1664525 + 1013904223) >>> 0) % n);
    };
    const scope = routes.filter((r) => !routeId || r.routeId === routeId);
    const base = { type, from, to };
    if (type === 'DELAYS') {
      const days = Math.min(14, Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1));
      const rows = Array.from({ length: days }, (_, i) => {
        const r = seed(`${routeId ?? 'all'}-${i}`);
        const d = new Date(new Date(to).getTime() - (days - 1 - i) * 86400000);
        return { label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), values: [r(9), 4 + r(14)] };
      });
      return delay({ ...base, title: 'Delays by day', columns: ['Delayed trips', 'Avg delay (min)'], rows, chartColumn: 0, unit: 'trips' });
    }
    const rows = scope.map((rt) => {
      const r = seed(String(rt.routeId));
      return type === 'OCCUPANCY'
        ? { label: `${rt.routeNo} ${rt.name}`, values: [35 + r(45), 70 + r(30)] }
        : { label: `${rt.routeNo} ${rt.name}`, values: [72 + r(26), 40 + r(120), 500 + r(4000)] };
    });
    return delay(
      type === 'OCCUPANCY'
        ? { ...base, title: 'Occupancy by route', columns: ['Average %', 'Peak %'], rows, chartColumn: 0, unit: '%' }
        : { ...base, title: 'Route performance', columns: ['On-time %', 'Trips', 'Tickets sold'], rows, chartColumn: 0, unit: '%' },
    );
  },

  async publishAlert(input: NewAlert): Promise<DelayAlert> {
    const a: DelayAlert = {
      alertId: nextAlertId++,
      tripId: input.tripId,
      type: input.type,
      message: input.message,
      delayMinutes: input.delayMinutes ?? null,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    alerts.unshift(a);
    return delay({ ...a });
  },

  async getTicket(ticketId: number): Promise<Ticket> {
    const t = tickets.find((x) => x.ticketId === ticketId);
    if (!t) throw new Error('Ticket not found.');
    return delay({ ...t });
  },

  async cancelTicket(ticketId: number): Promise<Ticket> {
    const t = tickets.find((x) => x.ticketId === ticketId);
    if (!t) throw new Error('Ticket not found.');
    if (t.status !== 'ACTIVE') throw new Error('Only an unused ticket can be cancelled.');
    t.status = 'CANCELLED';
    t.paymentStatus = 'REFUNDED';
    return delay({ ...t });
  },

  listTickets(status?: string, page = 1): Promise<TicketPage> {
    const all = tickets.filter((t) => !status || t.status === status);
    const items = all.slice((page - 1) * TICKET_PAGE_SIZE, page * TICKET_PAGE_SIZE);
    return delay({ items, nextPage: page * TICKET_PAGE_SIZE < all.length ? page + 1 : null });
  },

  // ---- admin panel ----

  async adminOverview(): Promise<AdminOverview> {
    const count = (role: Role) => users.filter((u) => u.role === role).length;
    const trips = await mockApi.adminTrips(utcDay(new Date()));
    const sold = tickets.filter((t) => t.paymentStatus === 'PAID' && utcDay(new Date(t.issuedAt)) === utcDay(new Date()));
    const currencies = [...new Set(sold.map((t) => t.currency ?? 'LKR'))];
    return delay({
      users: { total: users.length, passengers: count('PASSENGER'), staff: count('STAFF'), officers: count('AUTHORITY'), disabled: users.filter((u) => !u.isActive).length },
      fleet: { routes: routes.length, vehicles: adminVehicles.filter((v) => v.isActive).length, stops: allStops.length + (dubaiOn ? dubaiStops.length : 0) },
      tripsToday: {
        total: trips.length,
        ongoing: trips.filter((t) => t.status === 'ONGOING').length,
        delayed: trips.filter((t) => t.status === 'DELAYED').length,
        cancelled: trips.filter((t) => t.status === 'CANCELLED').length,
      },
      salesToday: {
        tickets: sold.length,
        revenue: sold.reduce((n, t) => n + t.fare, 0),
        byCurrency: currencies.map((currency) => {
          const list = sold.filter((t) => (t.currency ?? 'LKR') === currency);
          return { currency, tickets: list.length, revenue: list.reduce((n, t) => n + t.fare, 0) };
        }),
      },
    });
  },

  adminUsers({ q, role, page, limit }: { q?: string; role?: Role; page: number; limit: number }): Promise<AdminUserPage> {
    const needle = q?.trim().toLowerCase() ?? '';
    const all = users
      .filter((u) => (!role || u.role === role) && (!needle || [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(needle))))
      .sort((a, b) => b.userId - a.userId);
    const blank: AccountInfo = { createdAt: null, employeeNo: null, organisation: null, staffType: null, vehicleId: null };
    return delay({ total: all.length, users: all.slice((page - 1) * limit, page * limit).map((u) => ({ ...u, ...(accountInfo[u.userId] ?? blank) })) });
  },

  async adminCreateUser(input: NewStaffAccount): Promise<User> {
    if (input.role === 'STAFF' && !input.staffType) throw new Error('staffType: Choose conductor or inspector.');
    if (users.some((u) => (input.email && u.email === input.email) || (input.phone && u.phone === input.phone))) {
      throw new Error('An account with this email, phone or employee number already exists.');
    }
    if (input.vehicleId && !adminVehicles.some((v) => v.vehicleId === input.vehicleId)) throw new Error('Vehicle not found.');
    const user: User = {
      userId: Math.max(...users.map((u) => u.userId)) + 1,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      role: input.role,
      isActive: true,
    };
    users.push(user);
    passwords[user.userId] = input.password;
    accountInfo[user.userId] = {
      createdAt: new Date().toISOString(),
      employeeNo: input.employeeNo,
      organisation: input.organisation,
      staffType: input.role === 'STAFF' ? input.staffType! : null,
      vehicleId: input.role === 'STAFF' ? (input.vehicleId ?? null) : null,
    };
    return delay({ ...user });
  },

  async adminUpdateUser(userId: number, input: { isActive?: boolean; vehicleId?: number | null }): Promise<User> {
    const u = users.find((x) => x.userId === userId);
    if (!u) throw new Error('Account not found.');
    if (input.vehicleId !== undefined) {
      if (u.role !== 'STAFF') throw new Error('Only staff can be assigned to a vehicle.');
      if (input.vehicleId !== null && !adminVehicles.some((v) => v.vehicleId === input.vehicleId)) throw new Error('Vehicle not found.');
      accountInfo[userId] = { ...accountInfo[userId], vehicleId: input.vehicleId };
    }
    if (input.isActive !== undefined) u.isActive = input.isActive;
    return delay({ ...u });
  },

  adminRoutes: (): Promise<AdminRoute[]> =>
    delay(
      routes.map((r) => ({
        ...r,
        isActive: true,
        stops: routeStopsOf(r.routeId).length,
        vehicles: adminVehicles.filter((v) => v.routeId === r.routeId && v.isActive).length,
      })),
    ),

  adminVehicles: (): Promise<AdminVehicle[]> => delay(adminVehicles.map((v) => ({ ...v }))),

  async adminCreateVehicle(input: NewVehicle): Promise<AdminVehicle> {
    const route = routes.find((r) => r.routeId === input.routeId);
    if (!route) throw new Error('Route not found.');
    if (route.mode !== input.type) throw new Error(`A ${input.type.toLowerCase()} cannot run on a ${route.mode.toLowerCase()} route.`);
    if (adminVehicles.some((v) => v.regNo.toLowerCase() === input.regNo.toLowerCase())) throw new Error('A vehicle with this registration number already exists.');
    const v: AdminVehicle = { ...input, vehicleId: Math.max(...adminVehicles.map((x) => x.vehicleId)) + 1, routeNo: route.routeNo, isActive: true };
    adminVehicles.push(v);
    return delay({ ...v });
  },

  async adminUpdateVehicle(vehicleId: number, input: Partial<Pick<AdminVehicle, 'regNo' | 'capacity' | 'routeId' | 'isActive'>>): Promise<AdminVehicle> {
    const v = adminVehicles.find((x) => x.vehicleId === vehicleId);
    if (!v) throw new Error('Vehicle not found.');
    if (input.routeId !== undefined) {
      const route = routes.find((r) => r.routeId === input.routeId);
      if (!route) throw new Error('Route not found.');
      if (route.mode !== v.type) throw new Error(`A ${v.type.toLowerCase()} cannot run on a ${route.mode.toLowerCase()} route.`);
      v.routeNo = route.routeNo;
    }
    if (input.regNo !== undefined && adminVehicles.some((x) => x !== v && x.regNo.toLowerCase() === input.regNo!.toLowerCase())) {
      throw new Error('A vehicle with this registration number already exists.');
    }
    Object.assign(v, input);
    return delay({ ...v });
  },

  /** Sri Lanka: five trips a day per active vehicle, with a few delays and cancellations. Dubai: the real timetable. */
  adminTrips(date: string, routeId?: number): Promise<AdminTrip[]> {
    const dayStart = Date.parse(`${date}T00:00:00Z`);
    const dayKey = Number(date.slice(2).replace(/-/g, ''));
    const now = Date.now();
    const trips = adminVehicles
      .filter((v) => v.isActive && !isDubaiRoute(v.routeId) && (!routeId || v.routeId === routeId))
      .flatMap((v) =>
        Array.from({ length: 5 }, (_, i): AdminTrip => {
          const start = dayStart + ((1 + i * 3) * 60 + (v.vehicleId % 3) * 20) * 60000;
          const end = start + (v.type === 'TRAIN' ? 180 : 75) * 60000;
          const roll = (v.vehicleId + i + dayKey) % 7;
          let status: TripStatus = end < now ? 'COMPLETED' : start <= now ? 'ONGOING' : 'SCHEDULED';
          if (roll === 0) status = 'CANCELLED';
          else if (roll === 3 && status !== 'COMPLETED') status = 'DELAYED';
          const sold = status === 'CANCELLED' ? 0 : ((v.vehicleId * 7 + i * 13) % 40) + (status === 'SCHEDULED' ? 0 : 10);
          return {
            tripId: dayKey * 10000 + v.vehicleId * 10 + i,
            routeId: v.routeId,
            routeNo: v.routeNo,
            vehicleId: v.vehicleId,
            regNo: v.regNo,
            startTime: new Date(start).toISOString(),
            endTime: new Date(end).toISOString(),
            timeZone: 'Asia/Colombo',
            status,
            tickets: sold,
          };
        }),
      )
      .concat(dubaiOn ? dubaiAdminTrips(date, routeId) : [])
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return delay(trips.slice(0, 500)); // the server caps the list at 500 too
  },

  adminTickets({ status, page, limit }: { status?: TicketStatus; page: number; limit: number }): Promise<AdminTicketPage> {
    const all = tickets.filter((t) => !status || t.status === status).sort((a, b) => b.ticketId - a.ticketId);
    return delay({
      total: all.length,
      tickets: all.slice((page - 1) * limit, page * limit).map((t) => ({
        ticketId: t.ticketId,
        passenger: users[0].name,
        tripId: t.tripId,
        routeNo: t.routeNo ?? '',
        fare: t.fare,
        currency: t.currency,
        status: t.status,
        paymentStatus: t.paymentStatus ?? null,
        paymentMethod: t.paymentStatus === 'PAID' || t.paymentStatus === 'REFUNDED' ? 'CARD' : null,
        issuedAt: t.issuedAt,
      })),
    });
  },
};
