import {
  doc,
  onSnapshot,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type { Route, TripDetail, Vehicle } from '@/types/models';

import { getBackend } from './firebase';
import { toRoute, toVehicle } from './home-live';
import { resolveSchedule, toSchedule, type LiveSchedule } from './results-live';
import { buildTripDetail } from './trip-data';

/**
 * Live Firestore read for one trip: the schedule document, then its route and vehicle documents.
 * `onData` gets the finished trip, or `undefined` when the schedule (or its route or vehicle) does
 * not exist. It is called again whenever any of the three documents changes.
 */
export function subscribeTripDetail(
  scheduleId: string,
  onData: (detail: TripDetail | undefined) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const { db } = getBackend();
  let schedule: LiveSchedule | null | undefined; // null = missing, undefined = not loaded yet
  let route: Route | null | undefined;
  let vehicle: Vehicle | null | undefined;
  let links: { routeId: string; vehicleId: string } | undefined;
  let stopRoute: Unsubscribe | undefined;
  let stopVehicle: Unsubscribe | undefined;

  const read = <T>(snap: DocumentSnapshot<DocumentData>, convert: (d: QueryDocumentSnapshot<DocumentData>) => T) =>
    snap.exists() ? convert(snap as QueryDocumentSnapshot<DocumentData>) : null;

  const publish = () => {
    if (schedule === undefined) return;
    if (schedule === null) return onData(undefined);
    if (route === undefined || vehicle === undefined) return;
    if (route === null || vehicle === null) return onData(undefined);
    onData(buildTripDetail(resolveSchedule(schedule, vehicle), route, vehicle));
  };

  const stopSchedule = onSnapshot(
    doc(db, 'schedules', scheduleId),
    (snap) => {
      schedule = read(snap, toSchedule);
      if (!schedule) {
        links = undefined;
        stopRoute?.();
        stopVehicle?.();
        return publish();
      }
      // Follow the route and vehicle this schedule points at (again if they change).
      if (links?.routeId !== schedule.routeId) {
        stopRoute?.();
        route = undefined;
        stopRoute = onSnapshot(
          doc(db, 'routes', schedule.routeId),
          (s) => {
            route = read(s, toRoute);
            publish();
          },
          onError,
        );
      }
      if (links?.vehicleId !== schedule.vehicleId) {
        stopVehicle?.();
        vehicle = undefined;
        stopVehicle = onSnapshot(
          doc(db, 'vehicles', schedule.vehicleId),
          (s) => {
            vehicle = read(s, toVehicle);
            publish();
          },
          onError,
        );
      }
      links = { routeId: schedule.routeId, vehicleId: schedule.vehicleId };
      publish();
    },
    onError,
  );

  return () => {
    stopSchedule();
    stopRoute?.();
    stopVehicle?.();
  };
}
