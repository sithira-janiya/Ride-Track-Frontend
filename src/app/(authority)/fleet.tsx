import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { FleetMap } from '@/components/map/FleetMap';
import { byOperator, OperatorFilter } from '@/components/ops/OperatorFilter';
import { VehicleCard } from '@/components/ops/VehicleCard';
import { Chips, EmptyState, ErrorMessage, Loading, ScreenHeader } from '@/components/ui';
import { env } from '@/config/env';
import { multiRegion } from '@/config/regions';
import { useColors } from '@/hooks/use-colors';
import { useOpsDashboard } from '@/hooks/use-ops';
import { spacing } from '@/theme';
import type { Operator, Region } from '@/types';
import { REGION_LABEL, routeLabel } from '@/utils/format';

/** All vehicles on one map, filterable by route (FR9). Shares the dashboard's live data. */
export default function FleetScreen() {
  const c = useColors();
  const ops = useOpsDashboard();
  const routes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const [region, setRegion] = useState<Region>(env.regions[0]);
  const [operator, setOperator] = useState<Operator | undefined>(undefined);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const inRegion = (ops.data?.vehicles ?? []).filter((v) => (v.region ?? 'SRI_LANKA') === region);
  const vehicles = inRegion.filter((v) => (!routeId || v.routeId === routeId) && byOperator(operator)(v));
  const regionRoutes = (routes.data ?? []).filter((r) => r.region === region);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.top}>
        <ScreenHeader tone="authority" title="Live fleet" />
        {multiRegion ? (
          <Chips
            label="Region"
            value={region}
            onChange={(v) => {
              setRegion(v);
              setRouteId(undefined);
              setSelectedId(null);
            }}
            options={env.regions.map((r) => ({ value: r, label: REGION_LABEL[r] }))}
          />
        ) : null}
        <OperatorFilter
          vehicles={inRegion}
          value={operator}
          onChange={(v) => {
            setOperator(v);
            setSelectedId(null);
          }}
        />
        <Chips
          label="Filter by route"
          value={routeId}
          onChange={(v) => {
            setRouteId(v);
            setSelectedId(null);
          }}
          options={[{ value: undefined, label: 'All routes' }, ...regionRoutes.map((r) => ({ value: r.routeId as number | undefined, label: routeLabel(r) }))]}
          translateOptions={false}
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
  map: { flex: 3, minHeight: 220 },
  panel: { flex: 2 },
  panelContent: { padding: spacing.md, gap: spacing.sm },
});
