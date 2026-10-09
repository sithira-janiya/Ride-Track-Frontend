import { Tabs } from 'expo-router';

import { TabEmoji } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';

// Authority screens per docs/08-frontend-react-native.md: Dashboard · Fleet · Reports · Alerts, plus the Admin back office.
export default function AuthorityTabs() {
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
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabEmoji symbol="📊" focused={focused} /> }} />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet', tabBarIcon: ({ focused }) => <TabEmoji symbol="🚌" focused={focused} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ focused }) => <TabEmoji symbol="📈" focused={focused} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({ focused }) => <TabEmoji symbol="📢" focused={focused} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: ({ focused }) => <TabEmoji symbol="🛠️" focused={focused} /> }} />
    </Tabs>
  );
}
