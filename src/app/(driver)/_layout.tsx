import { Tabs } from 'expo-router';

import { useColors } from '@/hooks/use-colors';
import { useDriverMe, useLocationSharing } from '@/hooks/use-driver';

// Driver panel (RideTrack-API `/driver/*`): Bus · Trips · Report · QR code. A driver runs one bus.
export default function DriverTabs() {
  const c = useColors();
  const me = useDriverMe();
  // the phone is the bus's GPS while on duty; this runs whichever tab is open
  useLocationSharing(me.data?.onDuty ?? false);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: 14 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Bus' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips' }} />
      <Tabs.Screen name="report" options={{ title: 'Report' }} />
      <Tabs.Screen name="qr" options={{ title: 'QR code' }} />
    </Tabs>
  );
}
