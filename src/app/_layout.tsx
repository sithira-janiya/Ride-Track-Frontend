import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));
  const { hydrate, hydrated, user } = useAuth();

  // restore the saved session on app start
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // hold the splash screen until we know whether a session exists, so the login screen never flashes
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  const role = user?.role;
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Each group is only reachable for the matching state; guarded routes redirect to the first allowed route. */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={role === 'PASSENGER'}>
            <Stack.Screen name="(passenger)" />
          </Stack.Protected>
          <Stack.Protected guard={role === 'STAFF'}>
            <Stack.Screen name="(staff)" />
          </Stack.Protected>
          <Stack.Protected guard={role === 'AUTHORITY'}>
            <Stack.Screen name="(authority)" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
