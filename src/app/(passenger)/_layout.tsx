import { Tabs } from 'expo-router';

import { useColors } from '@/hooks/use-colors';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Home, Tickets and Profile exist so far; Alerts arrives in Phase 6 (Map opens from a route).
export default function PassengerTabs() {
  const c = useColors();
  return (
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
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* pushed from Home; keeps the tab bar but has no tab of its own */}
      <Tabs.Screen name="route/[id]" options={{ href: null }} />
      <Tabs.Screen name="map/[id]" options={{ href: null }} />
      <Tabs.Screen name="buy/[routeId]" options={{ href: null }} />
      <Tabs.Screen name="ticket/[id]" options={{ href: null }} />
    </Tabs>
  );
}
