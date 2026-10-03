import type { TransportType } from '@/constants/transport';

/** Shapes follow docs/design/DATA-MODEL.md so they can later be read straight from Firestore. */

export type VehicleStatus = 'on-time' | 'delayed';

export type Vehicle = {
  id: string;
  type: TransportType;
  /** Bus number plate or train name and number. */
  number: string;
  routeId: string;
  routeName: string;
  status: VehicleStatus;
  /** Minutes until it reaches the passenger's nearest stop. */
  etaMinutes: number;
  /** Next stop name. */
  nextStop: string;
  /** Onboard facilities, for example Air Conditioning or Wi-Fi. */
  facilities: string[];
};

/** A stop on a route. `at` is how far along the trip it is, from 0 (start) to 1 (end). */
export type Stop = {
  name: string;
  lat: number;
  lng: number;
  at: number;
};

export type Route = {
  id: string;
  type: TransportType;
  name: string;
  from: string;
  to: string;
  /** Fare in LKR. */
  fare: number;
  stops: Stop[];
};

export type Alert = {
  id: string;
  /** null means the alert applies to both buses and trains. */
  type: TransportType | null;
  title: string;
  message: string;
  /** Minutes ago, for display only. */
  minutesAgo: number;
};

export type Schedule = {
  id: string;
  type: TransportType;
  routeId: string;
  vehicleId: string;
  /** Departure time as "HH:MM", 24-hour. */
  departure: string;
  /** Trip length in minutes, so arrival = departure + duration. */
  durationMinutes: number;
  status: VehicleStatus;
  seatsAvailable: number;
};

/** One row in the Results list: a schedule together with its route. */
export type TripResult = {
  schedule: Schedule;
  route: Route;
  vehicle?: Vehicle;
};

/** A stop with the time the vehicle reaches it on this trip. */
export type StopTime = {
  stop: Stop;
  /** "HH:MM" */
  time: string;
};

/** Everything the Transport Details and Route & Stops screens need for one trip. */
export type TripDetail = {
  schedule: Schedule;
  route: Route;
  vehicle: Vehicle;
  stopTimes: StopTime[];
};
