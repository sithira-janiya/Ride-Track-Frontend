import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, EmptyState, ErrorMessage, Loading, TextField } from '@/components/ui';
import { ModeFilter, type ModeValue } from '@/features/routes/components/ModeFilter';
import { RouteCard } from '@/features/routes/components/RouteCard';
import { useNearbyStops } from '@/features/routes/hooks/use-nearby-stops';
import { useAllRoutes, useRouteSearch } from '@/features/routes/hooks/use-routes';
import { useFavourites } from '@/features/routes/stores/favourites';
import { useColors } from '@/hooks/use-colors';
import { useDebounce } from '@/hooks/use-debounce';
import { useT } from '@/i18n';
import { minTouchTarget, spacing, typography } from '@/theme';
import { formatDistance } from '@/utils/format';

export default function PassengerHome() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ModeValue>('ALL');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const searching = debouncedQuery.length > 0 || mode !== 'ALL';

  const openRoute = (id: number, stopId?: number) =>
    router.push({ pathname: '/route/[id]', params: stopId ? { id: String(id), stopId: String(stopId) } : { id: String(id) } });

  const results = useRouteSearch(debouncedQuery, mode, searching);

  const favouriteIds = useFavourites((s) => s.routeIds);
  const allRoutes = useAllRoutes();
  const favourites = (allRoutes.data ?? []).filter((r) => favouriteIds.includes(r.routeId));

  const nearby = useNearbyStops();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            {t('Where to?')}
          </Text>

          <TextField
            label="Search routes"
            value={query}
            onChangeText={setQuery}
            placeholder="Route number, name or place"
            autoCapitalize="none"
            returnKeyType="search"
          />
          <ModeFilter value={mode} onChange={setMode} />

          {searching ? (
            <Section title="Results">
              {results.isPending ? (
                <Loading label="Searching routes…" />
              ) : results.isError ? (
                <ErrorMessage message={errorMessage(results.error)} onRetry={() => results.refetch()} />
              ) : results.data.length === 0 ? (
                <EmptyState title="No routes found" message="Try a different route number, place or mode." />
              ) : (
                results.data.map((r) => <RouteCard key={r.routeId} route={r} onPress={() => openRoute(r.routeId)} />)
              )}
            </Section>
          ) : (
            <>
              <Section title="Favourite routes">
                {favourites.length === 0 ? (
                  <Text style={[styles.hint, { color: c.textSecondary }]}>
                    {t('Open a route and tap Save to keep it here for quick access.')}
                  </Text>
                ) : (
                  favourites.map((r) => <RouteCard key={r.routeId} route={r} onPress={() => openRoute(r.routeId)} />)
                )}
              </Section>

              <Section title="Stops near you">
                {nearby.permission === 'checking' ? (
                  <Loading label="Checking location…" />
                ) : nearby.permission === 'denied' ? (
                  <Card>
                    <Text style={[styles.hint, { color: c.text }]}>
                      {t('Allow location access to see the bus stops and stations closest to you.')}
                    </Text>
                    <Button title="Use my location" variant="secondary" onPress={nearby.request} />
                  </Card>
                ) : nearby.locationError ? (
                  <ErrorMessage message="We could not get your location. Check that GPS is on." onRetry={nearby.retryLocate} />
                ) : nearby.stops.isPending ? (
                  <Loading label="Finding stops near you…" />
                ) : nearby.stops.isError ? (
                  <ErrorMessage message={errorMessage(nearby.stops.error)} onRetry={() => nearby.stops.refetch()} />
                ) : nearby.stops.data.length === 0 ? (
                  <EmptyState title="No stops nearby" message="There are no stops within 1.5 km of you." />
                ) : (
                  nearby.stops.data.map((s) => (
                    <Pressable
                      key={s.stopId}
                      accessibilityRole="button"
                      accessibilityLabel={`${s.name}, ${t('{distance} away', { distance: formatDistance(s.distanceMeters ?? 0) })}`}
                      disabled={!s.routeIds?.length}
                      onPress={() => openRoute(s.routeIds![0], s.stopId)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                      <Card style={styles.stopCard}>
                        <Text style={[styles.stopName, { color: c.text }]}>{s.name}</Text>
                        <Text style={[styles.hint, { color: c.textSecondary }]}>
                          {formatDistance(s.distanceMeters ?? 0)}
                          {s.routeIds?.length
                            ? ` · ${t(s.routeIds.length > 1 ? '{count} routes' : '{count} route', { count: s.routeIds.length })}`
                            : ''}
                        </Text>
                      </Card>
                    </Pressable>
                  ))
                )}
              </Section>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
        {t(title)}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.title },
  hint: { ...typography.body },
  stopCard: { minHeight: minTouchTarget },
  stopName: { ...typography.bodyLarge, fontWeight: '600' },
});
