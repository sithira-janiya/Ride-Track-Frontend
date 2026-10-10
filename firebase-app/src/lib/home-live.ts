import {
  collection,
  limit,
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
import type { Alert, Route, Vehicle } from '@/types/models';

import { getBackend } from './firebase';

/**
 * Live Firestore reads for the passenger Home screen. Each function listens for changes and
 * calls `onData` again whenever the data changes, so Home updates without a refresh.
 * Collections and fields follow docs/design/DATA-MODEL.md and the backend seed script.
 * Every query filters by the transport type the passenger chose at the start.
 */

type OnData<T> = (items: T[]) => void;
type OnError = (error: FirestoreError) => void;

const text = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const number = (value: unknown, fallback = 0): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/** The vehicle's `location` map ({ lat, lng, updatedAt }) from Firestore, or undefined if it is missing or incomplete. */
function toLocation(value: unknown): Vehicle['location'] {
  const l = value as { lat?: unknown; lng?: unknown; updatedAt?: { toMillis?: () => number } } | null | undefined;
  if (typeof l?.lat !== 'number' || typeof l.lng !== 'number') return undefined;
  const updatedAt = typeof l.updatedAt?.toMillis === 'function' ? l.updatedAt.toMillis() : 0;
  return { lat: l.lat, lng: l.lng, updatedAt };
}

export function toVehicle(doc: QueryDocumentSnapshot<DocumentData>): Vehicle {
  const d = doc.data();
  return {
    id: doc.id,
    type: d.type === 'train' ? 'train' : 'bus',
    number: text(d.number, doc.id),
    routeId: text(d.routeId),
    routeName: text(d.routeName),
    // The seed uses 'on-time' and 'delayed'. Anything else is shown as on time.
    status: d.status === 'delayed' ? 'delayed' : 'on-time',
    etaMinutes: number(d.etaMinutes),
    nextStop: text(d.nextStop),
    facilities: Array.isArray(d.facilities) ? d.facilities.filter((f): f is string => typeof f === 'string') : [],
    capacity: typeof d.capacity === 'number' ? d.capacity : undefined,
    location: toLocation(d.location),
  };
}

export function toRoute(doc: QueryDocumentSnapshot<DocumentData>): Route {
  const d = doc.data();
  const rawStops: DocumentData[] = Array.isArray(d.stops) ? d.stops : [];
  const ordered = [...rawStops].sort((a, b) => number(a.order) - number(b.order));
  return {
    id: doc.id,
    type: d.type === 'train' ? 'train' : 'bus',
    name: text(d.name, doc.id),
    from: text(d.from),
    to: text(d.to),
    fare: number(d.fare),
    // Firestore stores stops in order; the app wants how far along the trip each one is.
    stops: ordered.map((s, i) => ({
      name: text(s.name),
      lat: number(s.lat),
      lng: number(s.lng),
      at: ordered.length > 1 ? i / (ordered.length - 1) : 0,
    })),
  };
}

export function toAlert(doc: QueryDocumentSnapshot<DocumentData>, now: number = Date.now()): Alert {
  const d = doc.data();
  const created = typeof d.createdAt?.toMillis === 'function' ? (d.createdAt.toMillis() as number) : now;
  return {
    id: doc.id,
    type: d.type === 'bus' || d.type === 'train' ? d.type : null,
    title: text(d.title),
    message: text(d.message),
    minutesAgo: Math.max(0, Math.round((now - created) / 60000)),
  };
}

/** Vehicles of the chosen type, closest (fewest minutes to arrive) first. */
export function subscribeVehicles(transport: TransportType, onData: OnData<Vehicle>, onError: OnError): Unsubscribe {
  const { db } = getBackend();
  const q = query(collection(db, 'vehicles'), where('type', '==', transport), orderBy('etaMinutes', 'asc'));
  return onSnapshot(q, (snap) => onData(snap.docs.map(toVehicle)), onError);
}

/** Published routes of the chosen type. Passengers can only read published routes. */
export function subscribeRoutes(transport: TransportType, onData: OnData<Route>, onError: OnError): Unsubscribe {
  const { db } = getBackend();
  const q = query(collection(db, 'routes'), where('type', '==', transport), where('published', '==', true));
  return onSnapshot(q, (snap) => onData(snap.docs.map(toRoute)), onError);
}

/** Newest alerts for the chosen type, plus alerts that apply to everyone. */
export function subscribeAlerts(transport: TransportType, onData: OnData<Alert>, onError: OnError): Unsubscribe {
  const { db } = getBackend();
  const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(
    q,
    (snap) => {
      const now = Date.now();
      onData(snap.docs.map((d) => toAlert(d, now)).filter((a) => a.type === null || a.type === transport));
    },
    onError,
  );
}
