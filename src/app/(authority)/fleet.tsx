import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { FleetMap } from '@/components/map/FleetMap';
import { VehicleCard } from '@/components/ops/VehicleCard';
import { Chips, EmptyState, ErrorMessage, FadeInView, Loading, ScreenHeader } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useOpsDashboard } from '@/hooks/use-ops';
import { spacing } from '@/theme';

/** All vehicles on one map, filterable by route (FR9). Shares the dashboard's live data. */
export default function FleetScreen() {
  const c = useColors();
  const ops = useOpsDashboard();
  const routes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const vehicles = (ops.data?.vehicles ?? []).filter((v) => !routeId || v.routeId === routeId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.top}>
        <ScreenHeader size="medium" title="Live fleet" emoji="🚌" emojiMotion="float" />
        <Chips
          label="Filter by route"
          value={routeId}
          onChange={(v) => {
            setRouteId(v);
            setSelectedId(null);
          }}
          options={[{ value: undefined, label: 'All routes', emoji: '🗺️' }, ...(routes.data ?? []).map((r) => ({ value: r.routeId as number | undefined, label: r.routeNo }))]}
        />
      </View>

      {ops.isPending ? (
        <Loading label="Loading fleet…" emoji="🛰️" />
      ) : ops.isError ? (
        <ErrorMessage message={errorMessage(ops.error)} onRetry={() => ops.refetch()} />
      ) : (
        <>
          <View style={styles.map}>
            <FleetMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />
          </View>
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            {vehicles.length === 0 ? (
              <EmptyState emoji="📭" title="No vehicles" message="No vehicle on this selection is reporting a position." />
            ) : (
              vehicles.map((v, i) => (
                <FadeInView key={`${routeId}-${v.vehicleId}`} index={i}>
                  <VehicleCard vehicle={v} selected={v.vehicleId === selectedId} onPress={() => setSelectedId(v.vehicleId)} />
                </FadeInView>
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
  map: { flex: 3, minHeight: 220 },
  panel: { flex: 2 },
  panelContent: { padding: spacing.md, gap: spacing.sm },
});
