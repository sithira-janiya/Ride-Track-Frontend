import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { useOnboarding } from '@/store/onboarding';

SplashScreen.preventAutoHideAsync();

const DAY = 24 * 60 * 60 * 1000;
/** Only public transport data is kept on the device, like LMT GO's offline routes and timetables. Alerts, tickets and live vehicles are not. */
const OFFLINE_KEYS = ['routes', 'route', 'arrivals', 'nearby-stops'];
const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'ridetrack.query-cache' });

const subscribeWelcome = (onChange: () => void) => useOnboarding.persist.onFinishHydration(onChange);
const welcomeHydrated = () => useOnboarding.persist.hasHydrated();
const notHydrated = () => false; // static web rendering: device storage is not read on the server

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, gcTime: DAY } } }));
  const { hydrate, hydrated, user } = useAuth();

  // restore the saved session on app start
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // the account's language wins once signed in; before that the device keeps the last one picked
  const userLanguage = user?.language;
  useEffect(() => {
    if (!userLanguage) return;
    const apply = () => useLanguage.getState().setLanguage(userLanguage);
    // the saved device language loads asynchronously; apply after it so it cannot overwrite the account's
    if (useLanguage.persist.hasHydrated()) apply();
    return useLanguage.persist.onFinishHydration(apply);
  }, [userLanguage]);

  // whether this device has seen the first-launch instructions loads asynchronously too
  const welcomeLoaded = useSyncExternalStore(subscribeWelcome, welcomeHydrated, notHydrated);

  // hold the splash screen until we know whether a session exists, so the login screen never flashes
  const ready = hydrated && welcomeLoaded;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const role = user?.role;
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: DAY,
        dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === 'success' && OFFLINE_KEYS.includes(String(q.queryKey[0])) },
      }}>
      {/* browser tab and home-screen bookmark name on web; no effect in the native app */}
      <Head>
        <title>RideTrack</title>
      </Head>
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
    </PersistQueryClientProvider>
  );
}
