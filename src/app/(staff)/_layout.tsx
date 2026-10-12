import { Tabs } from 'expo-router';

import { tabEmoji } from '@/components/ui/TabEmoji';
import { useTabBarOptions } from '@/hooks/use-tab-bar-options';

// Staff screens per docs/08-frontend-react-native.md: Scan · Passenger count · Shift.
export default function StaffTabs() {
  const tabBarOptions = useTabBarOptions();
  return (
    <Tabs screenOptions={tabBarOptions}>
      <Tabs.Screen name="index" options={{ title: 'Scan', tabBarIcon: tabEmoji('📷') }} />
      <Tabs.Screen name="count" options={{ title: 'Passengers', tabBarIcon: tabEmoji('🧍') }} />
      <Tabs.Screen name="shift" options={{ title: 'Shift', tabBarIcon: tabEmoji('🕒') }} />
    </Tabs>
  );
}
