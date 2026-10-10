import { Tabs } from 'expo-router';

import { tabIcon } from '@/components/ui/TabIcon';
import { useTabOptions } from '@/hooks/use-tab-options';

// Staff screens per docs/08-frontend-react-native.md: Scan · Passenger count · Shift.
export default function StaffTabs() {
  const tabOptions = useTabOptions();
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen name="index" options={{ title: 'Scan', tabBarIcon: tabIcon('📷') }} />
      <Tabs.Screen name="count" options={{ title: 'Passengers', tabBarIcon: tabIcon('👥') }} />
      <Tabs.Screen name="shift" options={{ title: 'Shift', tabBarIcon: tabIcon('🕒') }} />
    </Tabs>
  );
}
