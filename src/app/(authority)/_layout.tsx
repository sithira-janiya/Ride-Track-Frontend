import { Tabs } from 'expo-router';

import { useTabScreenOptions } from '@/hooks/use-tab-screen-options';

// Authority screens per docs/08-frontend-react-native.md: Dashboard · Fleet · Reports · Alerts, plus the Admin back office.
export default function AuthorityTabs() {
  const screenOptions = useTabScreenOptions();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet' }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin' }} />
    </Tabs>
  );
}
