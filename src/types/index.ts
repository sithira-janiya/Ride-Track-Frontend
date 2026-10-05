// Shared types matching the REST/WebSocket contract in docs/07-api.md.

export type Role = 'PASSENGER' | 'STAFF' | 'AUTHORITY';
export type TransportMode = 'BUS' | 'TRAIN';
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
}

export interface Stop {
  stopId: number;
  name: string;
  latitude: number;
  longitude: number;
  stopSequence?: number;
  fareFromOrigin?: number;
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
}

export interface Ticket {
  ticketId: number;
  tripId: number;
  boardStopId: number;
  alightStopId: number;
  fare: number;
  status: TicketStatus;
  qrToken: string | null;
  issuedAt: string;
  paymentStatus?: PaymentStatus;
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
