import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { alertsApi, userApi } from '@/api/endpoints';
import { env } from '@/config/env';
import { getSocket } from '@/socket';
import { useAlertBanner } from '@/store/alert-banner';
import { useAuth } from '@/store/auth';
import type { DelayAlert } from '@/types';

export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: () => alertsApi.list(), refetchInterval: 60_000 });
}

export function useUnreadCount() {
  const { data } = useAlerts();
  return data?.filter((a) => !a.isRead).length ?? 0;
}

/** Marks an alert read, updating the list straight away so the unread count drops without waiting. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.markRead(id),
    onMutate: (id) => {
      queryClient.setQueryData<DelayAlert[]>(['alerts'], (old) => old?.map((a) => (a.alertId === id ? { ...a, isRead: true } : a)));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

/** Shows a banner and refreshes the list when the server pushes `alert:new` (real mode only). */
export function useAlertSocket() {
  const queryClient = useQueryClient();
  const enabled = useAuth((s) => s.user?.notificationsEnabled !== false);
  const show = useAlertBanner((s) => s.show);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !enabled) return;
    const onAlert = (p: { message: string }) => {
      show(p.message);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    };
    socket.on('alert:new', onAlert);
    return () => {
      socket.off('alert:new', onAlert);
    };
  }, [enabled, queryClient, show]);
}

// show system notifications as a banner while the app is open, too
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

/**
 * Asks for notification permission and sends the device token to the server (`PUT /users/me/push-token`).
 * Quietly does nothing in mock mode, on web, when the user turned notifications off, or where remote push
 * is unavailable (for example Expo Go on Android): the in-app banner still works there.
 */
export function usePushRegistration() {
  const enabled = useAuth((s) => s.user?.notificationsEnabled !== false);
  useEffect(() => {
    if (!enabled || env.useMockApi || Platform.OS === 'web') return;
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', { name: 'Alerts', importance: Notifications.AndroidImportance.HIGH });
        }
        let { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
        if (status !== 'granted') return;
        const token = await Notifications.getDevicePushTokenAsync();
        await userApi.registerPushToken(String(token.data));
      } catch {
        // push is a bonus on top of the in-app alerts list; never block the app on it
      }
    })();
  }, [enabled]);
}
