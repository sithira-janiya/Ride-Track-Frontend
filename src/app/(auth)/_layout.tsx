import { Stack } from 'expo-router';

import { useOpenPendingBus } from '@/hooks/use-bus';

export default function AuthLayout() {
  // a bus scanned before the app was installed opens straight away: its screen needs no login
  useOpenPendingBus('signed-out');
  return <Stack screenOptions={{ headerShown: false }} />;
}
