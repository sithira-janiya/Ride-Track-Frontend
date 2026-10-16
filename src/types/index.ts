// Shared types matching the REST/WebSocket contract in docs/07-api.md.

export type Role = 'PASSENGER' | 'STAFF' | 'AUTHORITY';
export type TransportMode = 'BUS' | 'TRAIN';
/** Where a route runs. Sets the time zone its times are shown in and the currency of its fares. */
export type Region = 'SRI_LANKA' | 'DUBAI';
/** Who runs a vehicle: the state bus board, a private bus under an NTC route permit, or Sri Lanka Railways. */
export type Operator = 'SLTB' | 'PRIVATE' | 'SLR';
export type TripStatus = 'SCHEDULED' | 'ONGOING' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';
export type TicketStatus = 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ScanResult = 'VALID' | 'INVALID' | 'MANUAL_ID';
export type AlertType = 'DELAY' | 'CANCELLATION' | 'ROUTE_CHANGE';

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: { code: string; message: string };
}

export interface User {
  userId: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  language?: string;
  /** master switch for alert notifications (docs/07-api.md `PATCH /users/me`) */
  notificationsEnabled?: boolean;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: User;
}

export interface Route {
  routeId: number;
  routeNo: string;
  name: string;
  mode: TransportMode;
  origin: string;
  destination: string;
  region: Region;
  /** IANA zone of the route's region, e.g. Asia/Dubai: its times are shown in this zone */
  timeZone: string;
  /** ISO code of its fares, LKR or AED */
  currency: string;
  /** zone fares (Dubai RTA): the fare for a trip touching 1, 2, 3+ zones. Null: fares go by stop. */
  zoneFares: number[] | null;
  /** lowest fare charged on the route (Sri Lanka buses: the NTC minimum fare). Not sent by every server. */
  minFare?: number | null;
  /** who runs it; not sent by every server */
  operators?: Operator[];
}

export interface Stop {
  stopId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopSequence?: number;
  fareFromOrigin?: number;
  /** fare zone, on routes with zone fares */
  fareZone?: string | null;
  /** timetabled running time from the route's first stop */
  secondsFromOrigin?: number | null;
  /** only on /stops/nearby results */
  distanceMeters?: number;
  routeIds?: number[];
}

export interface RouteDetail extends Route {
  stops: Stop[];
}

export interface Arrival {
  tripId: number;
  routeId: number;
  vehicleId: number | null;
  eta: string;
  /** true when the time comes from the timetable, not a live position */
  scheduled: boolean;
  status: TripStatus;
}

export interface VehiclePosition {
  vehicleId: number;
  regNo?: string;
  lat: number;
  lng: number;
  eta: string | null;
  recordedAt: string;
  passengerCount?: number;
  capacity?: number;
  operator?: Operator;
}

export interface Ticket {
  ticketId: number;
  tripId: number;
  boardStopId: number;
  alightStopId: number;
  fare: number;
  /** of the fare; LKR when the server does not say */
  currency?: string;
  /** the route's time zone */
  timeZone?: string;
  status: TicketStatus;
  qrToken: string | null;
  issuedAt: string;
  paymentStatus?: PaymentStatus;
  /** display fields; the app falls back to ids when the server does not send them */
  routeNo?: string;
  boardStopName?: string;
  alightStopName?: string;
}

/** Returned by POST /tickets. `paymentUrl` is null in mock mode, which pays in-app. */
export interface PaymentSession {
  ticketId: number;
  paymentUrl: string | null;
}

export interface TicketPage {
  items: Ticket[];
  nextPage: number | null;
}

export interface DelayAlert {
  alertId: number;
  tripId: number;
  type: AlertType;
  message: string;
  delayMinutes: number | null;
  createdAt: string;
  isRead?: boolean;
}

export interface ScanOutcome {
  result: 'VALID' | 'INVALID';
  reason?: string;
}

// WebSocket events
export interface ServerToClientEvents {
  'vehicle:location': (p: { vehicleId: number; lat: number; lng: number; eta: string | null; recordedAt: string }) => void;
  'vehicle:occupancy': (p: { vehicleId: number; passengerCount: number; capacity: number }) => void;
  'alert:new': (p: { alertId: number; tripId: number; type: AlertType; message: string; delayMinutes: number | null }) => void;
  'ops:update': (p: unknown) => void;
}

export interface ClientToServerEvents {
  'route:subscribe': (p: { routeId: number }) => void;
  'route:unsubscribe': (p: { routeId: number }) => void;
}

export interface Occupancy {
  vehicleId: number;
  passengerCount: number;
  capacity: number;
}

// Authority (docs/07-api.md, "Authority operations")
export interface FleetVehicle extends VehiclePosition {
  routeId: number;
  routeNo: string;
  mode: TransportMode;
  region?: Region;
}

export interface OpsDashboard {
  vehicles: FleetVehicle[];
  activeDelays: DelayAlert[];
  occupancy: { totalPassengers: number; totalCapacity: number; fullVehicles: number };
}

export type ReportType = 'ROUTE_PERFORMANCE' | 'DELAYS' | 'OCCUPANCY';

export interface Report {
  type: ReportType;
  title: string;
  from: string;
  to: string;
  /** names of the value columns, in the order of each row's `values` */
  columns: string[];
  rows: { label: string; values: number[] }[];
  /** which value column the bar chart draws */
  chartColumn: number;
  unit: string;
}

export interface NewAlert {
  tripId: number;
  type: AlertType;
  message: string;
  delayMinutes?: number;
}

// Admin panel (RideTrack-API `/admin/*`, authority officers only)
export type StaffType = 'CONDUCTOR' | 'INSPECTOR';

export interface AdminOverview {
  users: { total: number; passengers: number; staff: number; officers: number; disabled: number };
  fleet: { routes: number; vehicles: number; stops: number };
  tripsToday: { total: number; ongoing: number; delayed: number; cancelled: number };
  /** revenue adds every currency together; show byCurrency instead */
  salesToday: { tickets: number; revenue: number; byCurrency?: { currency: string; tickets: number; revenue: number }[] };
}

export interface AdminUser extends User {
  createdAt: string | null;
  employeeNo: string | null;
  /** staff organisation, or the officer's department */
  organisation: string | null;
  staffType: StaffType | null;
  vehicleId: number | null;
}

export interface AdminUserPage {
  total: number;
  users: AdminUser[];
}

/** Staff and officer accounts are created here; passengers sign themselves up. */
export interface NewStaffAccount {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'STAFF' | 'AUTHORITY';
  employeeNo: string;
  organisation: string;
  staffType?: StaffType;
  vehicleId?: number;
}

export interface AdminRoute extends Route {
  isActive: boolean;
  /** counts */
  stops: number;
  vehicles: number;
}

export interface AdminVehicle {
  vehicleId: number;
  regNo: string;
  type: TransportMode;
  capacity: number;
  routeId: number;
  routeNo: string;
  isActive: boolean;
  operator?: Operator;
}

export interface NewVehicle {
  regNo: string;
  type: TransportMode;
  capacity: number;
  routeId: number;
}

export interface AdminTrip {
  tripId: number;
  routeId: number;
  routeNo: string;
  vehicleId: number;
  regNo: string;
  startTime: string;
  endTime: string | null;
  /** the route's time zone */
  timeZone?: string;
  status: TripStatus;
  /** tickets sold (active or used) */
  tickets: number;
}

export interface AdminTicket {
  ticketId: number;
  passenger: string;
  tripId: number;
  routeNo: string;
  fare: number;
  currency?: string;
  status: TicketStatus;
  paymentStatus: PaymentStatus | null;
  paymentMethod: string | null;
  issuedAt: string;
}

export interface AdminTicketPage {
  total: number;
  tickets: AdminTicket[];
}
