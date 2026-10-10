import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AlertBanner } from '@/components/alerts/AlertBanner';
import { tabIcon } from '@/components/ui/TabIcon';
import { useAlertSocket, usePushRegistration, useUnreadCount } from '@/hooks/use-alerts';
import { useTabOptions } from '@/hooks/use-tab-options';
import { useT } from '@/i18n';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Map is not a tab: it opens from a route.
export default function PassengerTabs() {
  const tabOptions = useTabOptions();
  const t = useT();
  const unread = useUnreadCount();
  useAlertSocket();
  usePushRegistration();

  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={tabOptions}>
        <Tabs.Screen name="index" options={{ title: t('Home'), tabBarIcon: tabIcon('🏠') }} />
        <Tabs.Screen name="tickets" options={{ title: t('Tickets'), tabBarIcon: tabIcon('🎟️') }} />
        <Tabs.Screen
          name="alerts"
          options={{
            title: t('Alerts'),
            tabBarIcon: tabIcon('🔔'),
            tabBarBadge: unread > 0 ? unread : undefined,
            tabBarAccessibilityLabel: unread > 0 ? t('Alerts, {count} unread', { count: unread }) : t('Alerts'),
          }}
        />
        <Tabs.Screen name="profile" options={{ title: t('Profile'), tabBarIcon: tabIcon('👤') }} />
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
