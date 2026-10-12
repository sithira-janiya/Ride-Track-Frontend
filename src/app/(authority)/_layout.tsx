import { Tabs } from 'expo-router';

import { tabEmoji } from '@/components/ui/TabEmoji';
import { useTabBarOptions } from '@/hooks/use-tab-bar-options';

// Authority screens per docs/08-frontend-react-native.md: Dashboard · Fleet · Reports · Alerts, plus the Admin back office.
export default function AuthorityTabs() {
  const tabBarOptions = useTabBarOptions();
  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabEmoji('📊') }} />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet', tabBarIcon: tabEmoji('🚌') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: tabEmoji('📈') }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: tabEmoji('🔔') }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: tabEmoji('🛠️') }} />
    </Tabs>
  );
}
