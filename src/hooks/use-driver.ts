import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect } from 'react';

import { errorCode, errorMessage } from '@/api/client';
import { driverApi } from '@/api/endpoints';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { useLocationShare } from '@/store/location-share';
import type { BusQr, DriverAlert, DriverOverview } from '@/types';

/** The driver, their bus and route, duty status, the trip in hand and the bus's live position (`GET /driver/me`). */
export function useDriverMe() {
  return useQuery({ queryKey: ['driver', 'me'], queryFn: driverApi.me, refetchInterval: 30_000 });
}

/** The bus's trips from 12 hours ago to 24 hours ahead. */
export function useDriverTrips(enabled = true) {
  return useQuery({ queryKey: ['driver', 'trips'], queryFn: driverApi.trips, enabled, refetchInterval: 60_000 });
}

export function useTripPassengers(tripId: number | null) {
  return useQuery({
    queryKey: ['driver', 'passengers', tripId],
    queryFn: () => driverApi.passengers(tripId!),
    enabled: tripId != null,
    refetchInterval: 30_000, // tickets are bought and scanned during the trip
  });
}

/** Every driver action changes what the panel shows, so each one refreshes all `driver` queries. */
function useDriverMutation<In, Out>(fn: (input: In) => Promise<Out>, onDone?: (out: Out) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (out) => {
      onDone?.(out);
      return queryClient.invalidateQueries({ queryKey: ['driver'] });
    },
  });
}

export function useSetDuty() {
  const queryClient = useQueryClient();
  return useDriverMutation(driverApi.setDuty, ({ onDuty }) =>
    queryClient.setQueryData<DriverOverview>(['driver', 'me'], (me) => (me ? { ...me, onDuty } : me)),
  );
}

/** Start (departing; also puts the driver on duty) or end (arrived) one of the bus's trips. */
export const useTripAction = () =>
  useDriverMutation(({ tripId, action }: { tripId: number; action: 'start' | 'end' }) =>
    action === 'start' ? driverApi.startTrip(tripId) : driverApi.endTrip(tripId),
  );

export const useDriverOccupancy = () => useDriverMutation(driverApi.setOccupancy);
export const useDriverAlert = () => useDriverMutation((input: DriverAlert) => driverApi.raiseAlert(input));
export const useRotateQr = () => useDriverMutation<void, BusQr>(() => driverApi.rotateQr());

/** Ends the shift on this phone: off duty (so the bus stops showing as staffed), session revoked, back to login. */
export async function driverSignOut() {
  const { refreshToken, logout } = useAuth.getState();
  await driverApi.setDuty(false).catch(() => {});
  if (refreshToken) await driverApi.logout(refreshToken).catch(() => {});
  disconnectSocket();
  await logout(); // root route guard returns to the login screen
}

/** The API allows 120 positions a minute; one every 5 s keeps the bus moving smoothly on passengers' maps. */
const SEND_EVERY_MS = 5_000;

/**
 * The driver's phone is the bus's GPS (RideTrack-API `POST /driver/location`). While `onDuty`, this watches the phone's
 * position and sends it; off duty it stops, because the server refuses positions then. Foreground only: the panel has to
 * stay open (see README, Known limitations).
 */
export function useLocationSharing(onDuty: boolean) {
  const queryClient = useQueryClient();
  const update = useLocationShare((s) => s.update);

  useEffect(() => {
    if (!onDuty) return;
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    let lastSent = 0;

    (async () => {
      update({ status: 'asking', error: null });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') return update({ status: 'denied' });
      update({ status: 'sharing' });
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: SEND_EVERY_MS, distanceInterval: 0 },
        async (pos) => {
          // iOS and web ignore timeInterval, so throttle here as well
          if (Date.now() - lastSent < SEND_EVERY_MS - 500) return;
          lastSent = Date.now();
          try {
            await driverApi.reportLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              recordedAt: new Date(pos.timestamp).toISOString(),
            });
            update({ status: 'sharing', lastSentAt: Date.now(), error: null });
          } catch (e) {
            // OFF_DUTY / NO_BUS_ASSIGNED: the server's view changed (e.g. an admin took the bus away); refresh the panel
            if (errorCode(e) === 'OFF_DUTY' || errorCode(e) === 'NO_BUS_ASSIGNED') queryClient.invalidateQueries({ queryKey: ['driver'] });
            update({ error: errorMessage(e) });
          }
        },
        (reason) => update({ status: 'error', error: reason }),
      );
      if (cancelled) subscription.remove();
    })().catch((e) => update({ status: 'error', error: errorMessage(e) }));

    return () => {
      cancelled = true;
      subscription?.remove();
      update({ status: 'off', error: null });
    };
  }, [onDuty, queryClient, update]);
}
