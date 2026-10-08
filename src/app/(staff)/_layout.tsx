import { Tabs } from 'expo-router';

import { useTabScreenOptions } from '@/hooks/use-tab-screen-options';

// Staff screens per docs/08-frontend-react-native.md: Scan · Passenger count · Shift.
export default function StaffTabs() {
  const screenOptions = useTabScreenOptions();
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ title: 'Scan' }} />
      <Tabs.Screen name="count" options={{ title: 'Passengers' }} />
      <Tabs.Screen name="shift" options={{ title: 'Shift' }} />
    </Tabs>
  );
}
