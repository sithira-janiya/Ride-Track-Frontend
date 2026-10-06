import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AlertBanner } from '@/components/alerts/AlertBanner';
import { useAlertSocket, usePushRegistration, useUnreadCount } from '@/hooks/use-alerts';
import { useColors } from '@/hooks/use-colors';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Map is not a tab: it opens from a route.
export default function PassengerTabs() {
  const c = useColors();
  const unread = useUnreadCount();
  useAlertSocket();
  usePushRegistration();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.textSecondary,
          tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
          tabBarLabelStyle: { fontSize: 14 },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="tickets" options={{ title: 'Tickets' }} />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarBadge: unread > 0 ? unread : undefined,
            tabBarAccessibilityLabel: unread > 0 ? `Alerts, ${unread} unread` : 'Alerts',
          }}
        />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
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
