import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { ModeFilter, type ModeValue } from '@/components/routes/ModeFilter';
import { RouteCard } from '@/components/routes/RouteCard';
import { Button, Card, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, PressableScale, ScreenHeader, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useDebounce } from '@/hooks/use-debounce';
import { useNearbyStops } from '@/hooks/use-nearby-stops';
import { useAuth } from '@/store/auth';
import { useFavourites } from '@/store/favourites';
import { minTouchTarget, spacing, typography } from '@/theme';
import { formatDistance } from '@/utils/format';

export default function PassengerHome() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const firstName = useAuth((s) => s.user?.name)?.split(' ')[0];
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ModeValue>('ALL');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const searching = debouncedQuery.length > 0 || mode !== 'ALL';

  const openRoute = (id: number, stopId?: number) =>
    router.push({ pathname: '/route/[id]', params: stopId ? { id: String(id), stopId: String(stopId) } : { id: String(id) } });

  // Route search (FR3): keyed on the debounced text so typing does not fire a request per keystroke.
  const results = useQuery({
    queryKey: ['routes', debouncedQuery, mode],
    queryFn: () => routesApi.search(debouncedQuery, mode === 'ALL' ? undefined : mode),
    enabled: searching,
  });

  const favouriteIds = useFavourites((s) => s.routeIds);
  const allRoutes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const favourites = (allRoutes.data ?? []).filter((r) => favouriteIds.includes(r.routeId));

  const nearby = useNearbyStops();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader
            title={t('Where to?')}
            emoji="🧭"
            subtitle={firstName ? t('{greeting}, {name}!', { greeting: t(greeting()), name: firstName }) : undefined}
          />

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
            <Section title="Results" emoji="🔎">
              {results.isPending ? (
                <Loading label="Searching routes…" emoji="🔎" />
              ) : results.isError ? (
                <ErrorMessage message={errorMessage(results.error)} onRetry={() => results.refetch()} />
              ) : results.data.length === 0 ? (
                <EmptyState illustration="routes" title="No routes found" message="Try a different route number, place or mode." />
              ) : (
                results.data.map((r, i) => (
                  <FadeInView key={r.routeId} index={i}>
                    <RouteCard route={r} onPress={() => openRoute(r.routeId)} />
                  </FadeInView>
                ))
              )}
            </Section>
          ) : (
            <>
              <Section title="Favourite routes" emoji="⭐">
                {favourites.length === 0 ? (
                  <Text style={[styles.hint, { color: c.textSecondary }]}>
                    {t('Open a route and tap Save to keep it here for quick access.')}
                  </Text>
                ) : (
                  favourites.map((r, i) => (
                    <FadeInView key={r.routeId} index={i}>
                      <RouteCard route={r} onPress={() => openRoute(r.routeId)} />
                    </FadeInView>
                  ))
                )}
              </Section>

              <Section title="Stops near you" emoji="📍">
                {nearby.permission === 'checking' ? (
                  <Loading label="Checking location…" emoji="📡" />
                ) : nearby.permission === 'denied' ? (
                  <Card>
                    <Text style={[styles.hint, { color: c.text }]}>
                      {t('Allow location access to see the bus stops and stations closest to you.')}
                    </Text>
                    <Button title="Use my location" emoji="📍" variant="secondary" onPress={nearby.request} />
                  </Card>
                ) : nearby.locationError ? (
                  <ErrorMessage message="We could not get your location. Check that GPS is on." onRetry={nearby.retryLocate} />
                ) : nearby.stops.isPending ? (
                  <Loading label="Finding stops near you…" emoji="🚏" />
                ) : nearby.stops.isError ? (
                  <ErrorMessage message={errorMessage(nearby.stops.error)} onRetry={() => nearby.stops.refetch()} />
                ) : nearby.stops.data.length === 0 ? (
                  <EmptyState illustration="routes" title="No stops nearby" message="There are no stops within 1.5 km of you." />
                ) : (
                  nearby.stops.data.map((s, i) => (
                    <FadeInView key={s.stopId} index={i}>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`${s.name}, ${t('{distance} away', { distance: formatDistance(s.distanceMeters ?? 0) })}`}
                        disabled={!s.routeIds?.length}
                        onPress={() => openRoute(s.routeIds![0], s.stopId)}>
                        <Card style={styles.stopCard}>
                          <View style={styles.stopRow}>
                            <Emoji symbol="🚏" size={22} />
                            <Text style={[styles.stopName, { color: c.text }]}>{s.name}</Text>
                          </View>
                          <Text style={[styles.hint, { color: c.textSecondary }]}>
                            {formatDistance(s.distanceMeters ?? 0)}
                            {s.routeIds?.length
                              ? ` · ${t(s.routeIds.length > 1 ? '{count} routes' : '{count} route', { count: s.routeIds.length })}`
                              : ''}
                          </Text>
                        </Card>
                      </PressableScale>
                    </FadeInView>
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

/** Time-of-day greeting in English; translated by the caller. */
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.section}>
      <View style={styles.stopRow}>
        <Emoji symbol={emoji} size={20} />
        <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
          {t(title)}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { ...typography.title },
  hint: { ...typography.body },
  stopCard: { minHeight: minTouchTarget },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stopName: { ...typography.bodyLarge, fontWeight: '600', flexShrink: 1 },
});
