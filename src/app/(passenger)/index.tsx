import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { AccountBar } from '@/components/auth/AccountBar';
import { ModeFilter, type ModeValue } from '@/components/routes/ModeFilter';
import { RouteCard } from '@/components/routes/RouteCard';
import { Button, Card, Chips, DashboardHero, EmptyState, ErrorMessage, Loading, SectionTitle, TextField } from '@/components/ui';
import { multiRegion } from '@/config/regions';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useDebounce } from '@/hooks/use-debounce';
import { useNearbyStops } from '@/hooks/use-nearby-stops';
import { useAuth } from '@/store/auth';
import { useFavourites } from '@/store/favourites';
import { minTouchTarget, spacing, typography } from '@/theme';
import type { Region } from '@/types';
import { formatDistance, REGION_LABEL } from '@/utils/format';
import { firstName, greetingTemplate } from '@/utils/greeting';

const REGIONS: { value: Region | undefined; label: string }[] = [
  { value: undefined, label: 'All places' },
  { value: 'SRI_LANKA', label: REGION_LABEL.SRI_LANKA },
  { value: 'DUBAI', label: REGION_LABEL.DUBAI },
];

export default function PassengerHome() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ModeValue>('ALL');
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const debouncedQuery = useDebounce(query.trim(), 300);
  const searching = debouncedQuery.length > 0 || mode !== 'ALL' || region != null;

  const openRoute = (id: number, stopId?: number) =>
    router.push({ pathname: '/route/[id]', params: stopId ? { id: String(id), stopId: String(stopId) } : { id: String(id) } });

  // Route search (FR3): keyed on the debounced text so typing does not fire a request per keystroke.
  const results = useQuery({
    queryKey: ['routes', debouncedQuery, mode, region ?? 'ALL'],
    queryFn: () => routesApi.search(debouncedQuery, mode === 'ALL' ? undefined : mode, region),
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
          <AccountBar />
          <DashboardHero
            tone="passenger"
            illustration="heroPassenger"
            eyebrow={greetingTemplate(user?.name)}
            eyebrowParams={{ name: firstName(user?.name) }}
            title="Where to?"
            subtitle="Live buses and trains, with your tickets in your pocket."
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
          {multiRegion ? <Chips label="Where" options={REGIONS} value={region} onChange={setRegion} /> : null}

          {searching ? (
            <Section title="Results" emoji="🔎">
              {results.isPending ? (
                <Loading label="Searching routes…" />
              ) : results.isError ? (
                <ErrorMessage message={errorMessage(results.error)} onRetry={() => results.refetch()} />
              ) : results.data.length === 0 ? (
                <EmptyState illustration="routes" title="No routes found" message="Try a different route number, place or mode." />
              ) : (
                results.data.map((r) => <RouteCard key={r.routeId} route={r} onPress={() => openRoute(r.routeId)} />)
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
                  favourites.map((r) => <RouteCard key={r.routeId} route={r} onPress={() => openRoute(r.routeId)} />)
                )}
              </Section>

              <Section title="Stops near you" emoji="📍">
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
                  <EmptyState illustration="routes" title="No stops nearby" message="There are no stops within 1.5 km of you." />
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

function Section({ title, emoji, children }: { title: string; emoji?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <SectionTitle title={title} emoji={emoji} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  section: { gap: spacing.sm },
  hint: { ...typography.body },
  stopCard: { minHeight: minTouchTarget },
  stopName: { ...typography.bodyLarge, fontWeight: '600' },
});
