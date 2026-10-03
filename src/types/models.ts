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
};

export type Route = {
  id: string;
  type: TransportType;
  name: string;
  from: string;
  to: string;
  /** Fare in LKR. */
  fare: number;
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
