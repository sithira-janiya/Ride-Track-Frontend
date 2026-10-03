import { Stack } from 'expo-router';

export default function PassengerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-transport" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" />
      <Stack.Screen name="transport/[id]" />
      <Stack.Screen name="route/[id]" />
      <Stack.Screen name="track/[id]" />
      <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
