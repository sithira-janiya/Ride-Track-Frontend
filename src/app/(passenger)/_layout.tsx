import { Stack } from 'expo-router';

export default function PassengerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-transport" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
