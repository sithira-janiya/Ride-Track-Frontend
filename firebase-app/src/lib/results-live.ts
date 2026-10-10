import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type { TransportType } from '@/constants/transport';
import type { Schedule, Vehicle } from '@/types/models';

import { getBackend } from './firebase';
import { toClock } from './format';

/**
 * Live Firestore reads for the passenger Results screen. A schedule document holds a type, a
 * routeId, a vehicleId and `departure` / `arrival` timestamps (docs/design/DATA-MODEL.md). The app
 * works with "HH:MM" plus a duration, so they are converted here.
 */

/** A schedule as stored: `status` and `seatsAvailable` are optional and filled in from the vehicle. */
export type LiveSchedule = Omit<Schedule, 'status' | 'seatsAvailable'> &
  Partial<Pick<Schedule, 'status' | 'seatsAvailable'>>;

const text = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const millis = (value: unknown): number | undefined => {
  const timestamp = value as { toMillis?: () => number } | null | undefined;
  return typeof timestamp?.toMillis === 'function' ? timestamp.toMillis() : undefined;
};

export function toSchedule(doc: QueryDocumentSnapshot<DocumentData>): LiveSchedule {
  const d = doc.data();
  const departure = millis(d.departure);
  const arrival = millis(d.arrival);
  const date = departure === undefined ? undefined : new Date(departure);
  const duration =
    departure !== undefined && arrival !== undefined && arrival > departure
      ? Math.round((arrival - departure) / 60000)
      : typeof d.durationMinutes === 'number'
        ? d.durationMinutes
        : 60;
  return {
    id: doc.id,
    type: d.type === 'train' ? 'train' : 'bus',
    routeId: text(d.routeId),
    vehicleId: text(d.vehicleId),
    departure: date ? toClock(date.getHours() * 60 + date.getMinutes()) : '00:00',
    durationMinutes: duration,
    status: d.status === 'delayed' ? 'delayed' : d.status === 'on-time' ? 'on-time' : undefined,
    seatsAvailable: typeof d.seatsAvailable === 'number' ? d.seatsAvailable : undefined,
  };
}

/** Fills in what the schedule document does not store: status and seats come from its vehicle. */
export function resolveSchedule(schedule: LiveSchedule, vehicle?: Vehicle): Schedule {
  return {
    ...schedule,
    status: schedule.status ?? vehicle?.status ?? 'on-time',
    seatsAvailable: schedule.seatsAvailable ?? vehicle?.capacity ?? 0,
  };
}

/** Schedules of the chosen type, earliest departure first. */
export function subscribeSchedules(
  transport: TransportType,
  onData: (items: LiveSchedule[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const { db } = getBackend();
  const q = query(collection(db, 'schedules'), where('type', '==', transport), orderBy('departure', 'asc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map(toSchedule)), onError);
}
