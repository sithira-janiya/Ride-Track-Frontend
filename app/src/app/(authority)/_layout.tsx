import { Tabs } from 'expo-router';

import { tabIcon } from '@/components/ui/TabIcon';
import { useTabOptions } from '@/hooks/use-tab-options';

// Authority screens per docs/08-frontend-react-native.md: Dashboard · Fleet · Reports · Alerts, plus the Admin back office.
export default function AuthorityTabs() {
  const tabOptions = useTabOptions();
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: tabIcon('📊') }} />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet', tabBarIcon: tabIcon('🚌') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: tabIcon('📈') }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: tabIcon('🔔') }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: tabIcon('🛠️') }} />
    </Tabs>
  );
}
