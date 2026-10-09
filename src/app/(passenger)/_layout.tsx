import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AlertBanner } from '@/components/alerts/AlertBanner';
import { useAlertSocket, usePushRegistration, useUnreadCount } from '@/hooks/use-alerts';
import { useColors } from '@/hooks/use-colors';
import { TabEmoji } from '@/components/ui';
import { useT } from '@/i18n';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Map is not a tab: it opens from a route.
export default function PassengerTabs() {
  const c = useColors();
  const t = useT();
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
          animation: 'shift',
        }}>
        <Tabs.Screen name="index" options={{ title: t('Home'), tabBarIcon: ({ focused }) => <TabEmoji symbol="🏠" focused={focused} /> }} />
        <Tabs.Screen name="tickets" options={{ title: t('Tickets'), tabBarIcon: ({ focused }) => <TabEmoji symbol="🎫" focused={focused} /> }} />
        <Tabs.Screen
          name="alerts"
          options={{
            title: t('Alerts'),
            tabBarIcon: ({ focused }) => <TabEmoji symbol="🔔" focused={focused} />,
            tabBarBadge: unread > 0 ? unread : undefined,
            tabBarAccessibilityLabel: unread > 0 ? t('Alerts, {count} unread', { count: unread }) : t('Alerts'),
          }}
        />
        <Tabs.Screen name="profile" options={{ title: t('Profile'), tabBarIcon: ({ focused }) => <TabEmoji symbol="👤" focused={focused} /> }} />
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
