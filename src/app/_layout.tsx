import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { BootLoader } from '@/components/loading/BootLoader';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';

SplashScreen.preventAutoHideAsync();
// iOS: fade the splash into the boot loader instead of cutting to it
SplashScreen.setOptions({ duration: 300, fade: true });

/** The boot loader stays up at least this long so it never just flashes. Time already spent loading counts. */
const MIN_BOOT_MS = 1200;
const startedAt = Date.now();
function bootTimeLeft() {
  // on the web, count from page load: the HTML boot screen was already showing while the bundle downloaded
  const elapsed = Platform.OS === 'web' && typeof performance !== 'undefined' ? performance.now() : Date.now() - startedAt;
  return Math.max(0, MIN_BOOT_MS - elapsed);
}

const subscribeNothing = () => () => {};
/** false while React takes over the static web HTML (rendered with nothing in it), true from then on and on native. */
function useIsClient() {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}

const DAY = 24 * 60 * 60 * 1000;
/** Only public transport data is kept on the device, like LMT GO's offline routes and timetables. Alerts, tickets and live vehicles are not. */
const OFFLINE_KEYS = ['routes', 'route', 'arrivals', 'nearby-stops'];
const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'ridetrack.query-cache' });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, gcTime: DAY } } }));
  const { hydrate, hydrated, user } = useAuth();
  const isClient = useIsClient();
  const [minTimeShown, setMinTimeShown] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

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

  // On every sign-out (the Log out button, or a session that could not be refreshed): close the live socket and drop
  // cached account data (tickets, alerts, profile, dashboards, admin lists) so the next person on this device never
  // sees it. Public routes and timetables stay cached for offline use.
  useEffect(
    () =>
      useAuth.subscribe((state, prev) => {
        if (!prev.user || state.user) return;
        disconnectSocket();
        queryClient.removeQueries({ predicate: (q) => !OFFLINE_KEYS.includes(String(q.queryKey[0])) });
      }),
    [queryClient],
  );

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeShown(true), bootTimeLeft());
    return () => clearTimeout(timer);
  }, []);

  // the splash hands over to the boot loader, which covers the app until the session is known
  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  const dropLoader = useCallback(() => setLoaderGone(true), []);

  if (!isClient) return null;

  const role = user?.role;
  return (
    <View style={styles.root}>
      {hydrated ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: DAY,
            dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === 'success' && OFFLINE_KEYS.includes(String(q.queryKey[0])) },
          }}>
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
      ) : null}
      {loaderGone ? null : <BootLoader leaving={hydrated && minTimeShown} onShown={hideSplash} onGone={dropLoader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
