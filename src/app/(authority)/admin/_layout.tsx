import { Stack } from 'expo-router';

import { useColors } from '@/hooks/use-colors';

// Opening a sub-screen directly (web refresh, deep link) still puts the overview underneath, so the back arrow works.
export const unstable_settings = { anchor: 'index' };

// Admin back office: an overview, then one screen per area. Sub-screens get a header with a back button.
export default function AdminStack() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.primary,
        headerTitleStyle: { color: c.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Admin' }} />
      <Stack.Screen name="users" options={{ title: 'Accounts' }} />
      <Stack.Screen name="new-account" options={{ title: 'New staff account' }} />
      <Stack.Screen name="vehicles" options={{ title: 'Vehicles' }} />
      <Stack.Screen name="routes" options={{ title: 'Routes' }} />
      <Stack.Screen name="trips" options={{ title: 'Trips' }} />
      <Stack.Screen name="tickets" options={{ title: 'Tickets' }} />
    </Stack>
  );
}
