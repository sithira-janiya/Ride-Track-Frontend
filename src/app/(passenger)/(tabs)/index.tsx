import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { AlertCard } from '@/components/home/alert-card';
import { RouteCard } from '@/components/home/route-card';
import { VehicleCard } from '@/components/home/vehicle-card';
import { SearchForm } from '@/components/search/search-form';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { greeting } from '@/lib/format';
import { getAlerts, getNearbyVehicles, getPopularRoutes, getRoutesByIds } from '@/lib/home-data';
import { useSavedRoutesStore } from '@/store/saved-routes-store';
import { useTransportStore } from '@/store/transport-store';

export default function HomeScreen() {
  const transport = useTransportStore((s) => s.transport);
  const savedIds = useSavedRoutesStore((s) => s.routeIds);
  const toggleRoute = useSavedRoutesStore((s) => s.toggleRoute);

  const data = useMemo(() => {
    if (!transport) return null;
    return {
      vehicles: getNearbyVehicles(transport),
      saved: getRoutesByIds(transport, savedIds),
      popular: getPopularRoutes(transport),
      alerts: getAlerts(transport),
    };
  }, [transport, savedIds]);

  if (!transport || !data) return null;
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
      <SectionHeader title="Alerts" hint="From the transport authority" />
      {data.alerts.length === 0 ? (
        <Text style={styles.muted}>No alerts right now.</Text>
      ) : (
        data.alerts.slice(0, 2).map((alert) => <AlertCard key={alert.id} alert={alert} />)
      )}

      <SectionHeader title={`Nearby ${option.plural.toLowerCase()}`} hint="Closest first, by minutes to arrive" />
      {data.vehicles.length === 0 ? (
        <Text style={styles.muted}>No {option.plural.toLowerCase()} nearby.</Text>
      ) : (
        data.vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
      )}

      <SectionHeader title="Saved routes" />
      {data.saved.length === 0 ? (
        <Text style={styles.muted}>Nothing saved yet. Tap the bookmark on a route below.</Text>
      ) : (
        data.saved.map((route) => <RouteCard key={route.id} route={route} saved onToggleSave={toggleRoute} />)
      )}

      <SectionHeader title="Popular routes" />
      {data.popular.map((route) => (
        <RouteCard key={route.id} route={route} saved={savedIds.includes(route.id)} onToggleSave={toggleRoute} />
      ))}

      <Text variant="bodySmall" style={styles.muted}>
        Sample data for now. It will switch to live data when the backend is connected.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: { gap: spacing.sm },
  cardLabel: { color: colors.textMuted, letterSpacing: 0.6 },
  muted: { color: colors.textMuted },
});
