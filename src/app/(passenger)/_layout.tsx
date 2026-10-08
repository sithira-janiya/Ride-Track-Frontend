import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AlertBanner } from '@/components/alerts/AlertBanner';
import { useAlertSocket, usePushRegistration, useUnreadCount } from '@/hooks/use-alerts';
import { useOpenPendingBus } from '@/hooks/use-bus';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';

// Passenger tabs: Home · Scan · Tickets · Alerts · Profile. Scan opens the bus you are on from the QR inside it
// (the bus screen itself is /bus/[code], outside this group, so it also works before login). Map opens from a route.
export default function PassengerTabs() {
  const c = useColors();
  const t = useT();
  const unread = useUnreadCount();
  useAlertSocket();
  usePushRegistration();
  useOpenPendingBus('passenger'); // a bus scanned before login, or before the app was installed

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
        <Tabs.Screen name="index" options={{ title: t('Home') }} />
        <Tabs.Screen name="scan" options={{ title: t('Scan') }} />
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
