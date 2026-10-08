import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AlertBanner } from '@/features/alerts/components/AlertBanner';
import { useAlertSocket, useUnreadCount } from '@/features/alerts/hooks/use-alerts';
import { usePushRegistration } from '@/features/alerts/hooks/use-push-registration';
import { useTabScreenOptions } from '@/hooks/use-tab-screen-options';
import { useT } from '@/i18n';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Map is not a tab: it opens from a route.
export default function PassengerTabs() {
  const t = useT();
  const screenOptions = useTabScreenOptions();
  const unread = useUnreadCount();
  useAlertSocket();
  usePushRegistration();

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen name="index" options={{ title: t('Home') }} />
        <Tabs.Screen name="tickets" options={{ title: t('Tickets') }} />
        <Tabs.Screen
          name="alerts"
          options={{
            title: t('Alerts'),
            tabBarBadge: unread > 0 ? unread : undefined,
            tabBarAccessibilityLabel: unread > 0 ? t('Alerts, {count} unread', { count: unread }) : t('Alerts'),
          }}
        />
        <Tabs.Screen name="profile" options={{ title: t('Profile') }} />
        {/* pushed from other screens; keep the tab bar but have no tab of their own */}
        <Tabs.Screen name="route/[id]" options={{ href: null }} />
        <Tabs.Screen name="map/[id]" options={{ href: null }} />
        <Tabs.Screen name="buy/[routeId]" options={{ href: null }} />
        <Tabs.Screen name="ticket/[id]" options={{ href: null }} />
      </Tabs>
      <AlertBanner />
    </View>
  );
}
