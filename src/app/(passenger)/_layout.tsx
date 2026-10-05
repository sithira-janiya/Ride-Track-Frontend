import { Tabs } from 'expo-router';

import { useColors } from '@/hooks/use-colors';

// Passenger tabs per docs/08-frontend-react-native.md: Home · Map · Tickets · Alerts · Profile.
// Only Home and Profile exist so far; the rest arrive in Phases 2-6.
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
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
