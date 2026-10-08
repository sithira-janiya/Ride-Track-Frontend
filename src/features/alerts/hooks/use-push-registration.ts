import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { userApi } from '@/api/endpoints';
import { env } from '@/config/env';
import { useAuth } from '@/store/auth';

type NotificationsModule = typeof import('expo-notifications');

/**
 * expo-notifications throws as soon as it is imported in Expo Go on Android, so it is loaded lazily and
 * skipped there. Returns null when it is unavailable; the in-app banner and Alerts tab still work.
 */
let notifications: NotificationsModule | null | undefined;
function getNotifications(): NotificationsModule | null {
  if (notifications !== undefined) return notifications;
  const inExpoGoAndroid = Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (Platform.OS === 'web' || inExpoGoAndroid) return (notifications = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notifications = require('expo-notifications') as NotificationsModule;
    // show system notifications as a banner while the app is open, too
    notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
    });
  } catch {
    notifications = null;
  }
  return notifications;
}

/**
 * Asks for notification permission and sends the device token to the server (`PUT /users/me/push-token`).
 * Quietly does nothing in mock mode, on web, when the user turned notifications off, or where remote push
 * is unavailable (for example Expo Go on Android): the in-app banner still works there.
 */
export function usePushRegistration() {
  const enabled = useAuth((s) => s.user?.notificationsEnabled !== false);
  useEffect(() => {
    if (!enabled || env.useMockApi || Platform.OS === 'web') return;
    const Notifications = getNotifications();
    if (!Notifications) return;
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
