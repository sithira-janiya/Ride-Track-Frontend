import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { LiveMap } from '@/components/map/LiveMap';
import { Button, Card, ErrorMessage, ETAChip, Loading, OccupancyBar, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT, type Translate } from '@/i18n';
import { STALE_AFTER_MS, useLiveVehicles, useNow } from '@/hooks/use-live-vehicles';
import { spacing, typography } from '@/theme';

function ago(ms: number, t: Translate) {
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? t('{n} s ago', { n: s }) : t('{n} min ago', { n: Math.round(s / 60) });
}

export default function LiveMapScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const routeId = Number(useLocalSearchParams<{ id: string }>().id);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const route = useQuery({ queryKey: ['route', routeId], queryFn: () => routesApi.detail(routeId), enabled: Number.isFinite(routeId) });
  const { vehicles, query, connected, lastUpdated } = useLiveVehicles(routeId);
  const now = useNow();

  const stale = lastUpdated != null && now - lastUpdated > STALE_AFTER_MS;
  const selected = vehicles.find((v) => v.vehicleId === selectedId) ?? vehicles[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.top}>
        <Button title="← Back" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
          {t('Live map')}
          {route.data ? ` · ${route.data.routeNo}` : ''}
        </Text>
      </View>

      {route.isPending ? (
        <Loading label="Loading route…" />
      ) : route.isError ? (
        <ErrorMessage message={errorMessage(route.error)} onRetry={() => route.refetch()} />
      ) : (
        <>
          <View style={styles.map}>
            <LiveMap
              stops={route.data.stops}
              vehicles={vehicles}
              mode={route.data.mode}
              selectedVehicleId={selected?.vehicleId ?? null}
              onSelectVehicle={setSelectedId}
            />
          </View>

          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            {/* status by icon-free text AND tone, never colour alone (NFR8) */}
            <View style={styles.statusRow}>
              <StatusBadge label={connected ? 'Live' : 'Reconnecting…'} tone={connected ? 'success' : 'warning'} />
              <Text style={[styles.caption, { color: c.textSecondary }]}>
                {lastUpdated ? t('Updated {ago}', { ago: ago(now - lastUpdated, t) }) : t('Waiting for first update…')}
              </Text>
            </View>
            {stale ? (
              <Text accessibilityRole="alert" style={[styles.caption, { color: c.warning }]}>
                {t('Positions may be out of date. Vehicle locations have not updated for over a minute.')}
              </Text>
            ) : null}

            {query.isPending ? (
              <Loading label="Finding vehicles…" />
            ) : query.isError ? (
              <ErrorMessage message={errorMessage(query.error)} onRetry={() => query.refetch()} />
            ) : vehicles.length === 0 ? (
              <Text style={[styles.body, { color: c.textSecondary }]}>
                {t('No vehicles are currently reporting a position on this route.')}
              </Text>
            ) : (
              vehicles.map((v) => (
                <Card key={v.vehicleId} style={v.vehicleId === selected?.vehicleId ? { borderColor: c.primary, borderWidth: 2 } : undefined}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.vehicleName, { color: c.text }]}>{v.regNo ?? t('Vehicle {id}', { id: v.vehicleId })}</Text>
                    <ETAChip eta={v.eta} />
                  </View>
                  <OccupancyBar passengerCount={v.passengerCount} capacity={v.capacity} />
                  <Button
                    title={v.vehicleId === selected?.vehicleId ? 'Selected on map' : 'Show on map'}
                    variant="secondary"
                    onPress={() => setSelectedId(v.vehicleId)}
                  />
                </Card>
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
  map: { flex: 3, minHeight: 240 },
  panel: { flex: 2 },
  panelContent: { padding: spacing.md, gap: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  caption: { ...typography.caption },
  body: { ...typography.body },
  vehicleName: { ...typography.bodyLarge, fontWeight: '700' },
});
