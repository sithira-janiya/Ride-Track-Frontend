import { Tabs } from 'expo-router';

import { useColors } from '@/hooks/use-colors';

// Staff screens per docs/08-frontend-react-native.md: Scan · Passenger count · Shift.
export default function StaffTabs() {
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
      <Tabs.Screen name="index" options={{ title: 'Scan' }} />
      <Tabs.Screen name="count" options={{ title: 'Passengers' }} />
      <Tabs.Screen name="shift" options={{ title: 'Shift' }} />
    </Tabs>
  );
}
