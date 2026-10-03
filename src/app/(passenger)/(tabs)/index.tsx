import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AlertCard } from '@/components/home/alert-card';
import { RouteCard } from '@/components/home/route-card';
import { VehicleCard } from '@/components/home/vehicle-card';
import { SearchForm } from '@/components/search/search-form';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { useHomeData, type HomeSource } from '@/hooks/use-home-data';
import { greeting } from '@/lib/format';
import { useSavedRoutesStore } from '@/store/saved-routes-store';
import { useTransportStore } from '@/store/transport-store';

const sampleReason: Record<Extract<HomeSource, { kind: 'sample' }>['reason'], string> = {
  'not-configured': 'Showing sample data. Add the Firebase keys to .env to see live data.',
  'signed-out': 'Showing sample data. Sign in to see live data.',
  error: 'Showing sample data because live data could not be read',
  slow: 'Showing sample data because the connection is slow.',
};

export default function HomeScreen() {
  const transport = useTransportStore((s) => s.transport);
  const savedIds = useSavedRoutesStore((s) => s.routeIds);
  const toggleRoute = useSavedRoutesStore((s) => s.toggleRoute);
  const { vehicles, routes, alerts, loading, source } = useHomeData(transport);

  const saved = useMemo(() => routes.filter((r) => savedIds.includes(r.id)), [routes, savedIds]);

  if (!transport) return null;
  const option = transportOptions[transport];

  return (
    <Screen
      title={`${greeting()}!`}
      subtitle="Where are you travelling today?"
      headerExtra={
        <SurfaceCard style={styles.searchCard}>
          <Text variant="labelMedium" style={styles.cardLabel}>
            SEARCH YOUR JOURNEY
          </Text>
          <SearchForm />
        </SurfaceCard>
      }
    >
      <View style={styles.sourceRow}>
        <View style={[styles.dot, { backgroundColor: source.kind === 'live' ? colors.success : colors.warning }]} />
        <Text variant="labelMedium" style={styles.muted}>
          {source.kind === 'live' ? 'Live data' : 'Sample data'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <>
          <SectionHeader title="Alerts" hint="From the transport authority" />
          {alerts.length === 0 ? (
            <Text style={styles.muted}>No alerts right now.</Text>
          ) : (
            alerts.slice(0, 2).map((alert) => <AlertCard key={alert.id} alert={alert} />)
          )}

          <SectionHeader title={`Nearby ${option.plural.toLowerCase()}`} hint="Closest first, by minutes to arrive" />
          {vehicles.length === 0 ? (
            <Text style={styles.muted}>No {option.plural.toLowerCase()} nearby.</Text>
          ) : (
            vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
          )}

          <SectionHeader title="Saved routes" />
          {saved.length === 0 ? (
            <Text style={styles.muted}>Nothing saved yet. Tap the bookmark on a route below.</Text>
          ) : (
            saved.map((route) => <RouteCard key={route.id} route={route} saved onToggleSave={toggleRoute} />)
          )}

          <SectionHeader title="Popular routes" />
          {routes.length === 0 ? (
            <Text style={styles.muted}>No routes are published yet.</Text>
          ) : (
            routes.map((route) => (
              <RouteCard key={route.id} route={route} saved={savedIds.includes(route.id)} onToggleSave={toggleRoute} />
            ))
          )}
        </>
      )}

      {source.kind === 'sample' ? (
        <Text variant="bodySmall" style={styles.muted}>
          {sampleReason[source.reason]}
          {source.reason === 'error' && source.detail ? ` (${source.detail}).` : ''}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: { gap: spacing.sm },
  cardLabel: { color: colors.textMuted, letterSpacing: 0.6 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  loading: { marginVertical: spacing.lg },
  muted: { color: colors.textMuted },
});
