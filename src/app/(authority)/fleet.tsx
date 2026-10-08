import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Chips, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { FleetMap } from '@/features/map/components/FleetMap';
import { VehicleCard } from '@/features/ops/components/VehicleCard';
import { useOpsDashboard } from '@/features/ops/hooks/use-ops';
import { useAllRoutes } from '@/features/routes/hooks/use-routes';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

/** All vehicles on one map, filterable by route (FR9). Shares the dashboard's live data. */
export default function FleetScreen() {
  const c = useColors();
  const ops = useOpsDashboard();
  const routes = useAllRoutes();
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const vehicles = (ops.data?.vehicles ?? []).filter((v) => !routeId || v.routeId === routeId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.top}>
        <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
          Live fleet
        </Text>
        <Chips
          label="Filter by route"
          value={routeId}
          onChange={(v) => {
            setRouteId(v);
            setSelectedId(null);
          }}
          options={[{ value: undefined, label: 'All routes' }, ...(routes.data ?? []).map((r) => ({ value: r.routeId as number | undefined, label: r.routeNo }))]}
        />
      </View>

      {ops.isPending ? (
        <Loading label="Loading fleet…" />
      ) : ops.isError ? (
        <ErrorMessage message={errorMessage(ops.error)} onRetry={() => ops.refetch()} />
      ) : (
        <>
          <View style={styles.map}>
            <FleetMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />
          </View>
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            {vehicles.length === 0 ? (
              <EmptyState title="No vehicles" message="No vehicle on this selection is reporting a position." />
            ) : (
              vehicles.map((v) => (
                <VehicleCard key={v.vehicleId} vehicle={v} selected={v.vehicleId === selectedId} onPress={() => setSelectedId(v.vehicleId)} />
              ))
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { padding: spacing.md, gap: spacing.sm },
  heading: { ...typography.title },
  map: { flex: 3, minHeight: 220 },
  panel: { flex: 2 },
  panelContent: { padding: spacing.md, gap: spacing.sm },
});
