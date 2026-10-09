import { Tabs } from 'expo-router';

import { TabEmoji } from '@/components/ui';
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
        animation: 'shift',
      }}>
      <Tabs.Screen name="index" options={{ title: 'Scan', tabBarIcon: ({ focused }) => <TabEmoji symbol="📷" focused={focused} /> }} />
      <Tabs.Screen name="count" options={{ title: 'Passengers', tabBarIcon: ({ focused }) => <TabEmoji symbol="👥" focused={focused} /> }} />
      <Tabs.Screen name="shift" options={{ title: 'Shift', tabBarIcon: ({ focused }) => <TabEmoji symbol="🕒" focused={focused} /> }} />
    </Tabs>
  );
}
