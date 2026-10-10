import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi, vehiclesApi } from '@/api/endpoints';
import { Button, Card, EmptyState, ErrorMessage, Loading, OccupancyBar } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useShift } from '@/store/shift';
import { spacing, typography } from '@/theme';

/** Update the on-board passenger count for the shift's vehicle (FR7, `POST /vehicles/:id/occupancy`). */
export default function PassengerCountScreen() {
  const c = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shift = useShift((s) => s.shift);

  const vehicles = useQuery({
    queryKey: ['vehicles', shift?.routeId],
    queryFn: () => routesApi.vehicles(shift!.routeId),
    enabled: !!shift,
  });
  const vehicle = vehicles.data?.find((v) => v.vehicleId === shift?.vehicleId);
  const capacity = vehicle?.capacity ?? 0;

  // local draft so staff can tap +/- quickly and send once
  const [draft, setDraft] = useState<number | null>(null);
  const [seen, setSeen] = useState<number | undefined>(undefined);
  if (vehicle?.passengerCount !== seen) {
    setSeen(vehicle?.passengerCount);
    setDraft(vehicle?.passengerCount ?? null);
  }

  const save = useMutation({
    mutationFn: (count: number) => vehiclesApi.setOccupancy(shift!.vehicleId, count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles', shift?.routeId] }),
  });
  useEffect(() => save.reset(), [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (delta: number) => setDraft((d) => Math.max(0, Math.min(capacity || Infinity, (d ?? 0) + delta)));
  const dirty = draft != null && draft !== vehicle?.passengerCount;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Passengers on board
          </Text>

          {!shift ? (
            <EmptyState title="No shift started" message="Choose your route and trip on the Shift tab first." />
          ) : vehicles.isPending ? (
            <Loading label="Loading vehicle…" />
          ) : vehicles.isError ? (
            <ErrorMessage message={errorMessage(vehicles.error)} onRetry={() => vehicles.refetch()} />
          ) : !vehicle || draft == null ? (
            <EmptyState title="Vehicle not found" message="This vehicle is not reporting on the route. Check your shift." />
          ) : (
            <>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Route {shift.routeNo} · {vehicle.regNo ?? `Vehicle ${vehicle.vehicleId}`}
              </Text>
              <Card>
                <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.2} style={[styles.count, { color: c.text }]}>
                  {draft}
                  <Text style={[styles.of, { color: c.textSecondary }]}> / {capacity}</Text>
                </Text>
                <OccupancyBar passengerCount={draft} capacity={capacity} />
              </Card>

              <View style={styles.row}>
                <Button title="− 1" variant="secondary" onPress={() => change(-1)} style={styles.step} />
                <Button title="+ 1" variant="secondary" onPress={() => change(1)} style={styles.step} />
              </View>
              <View style={styles.row}>
                <Button title="− 5" variant="secondary" onPress={() => change(-5)} style={styles.step} />
                <Button title="+ 5" variant="secondary" onPress={() => change(5)} style={styles.step} />
              </View>

              {save.isError ? <ErrorMessage message={errorMessage(save.error)} /> : null}
              {save.isSuccess ? (
                <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
                  ✓ Count saved
                </Text>
              ) : null}
              <Button title="Save count" loading={save.isPending} disabled={!dirty} onPress={() => save.mutate(draft)} />
              <Button title="Back to scanning" variant="secondary" onPress={() => router.navigate('/')} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  body: { ...typography.body },
  count: { fontSize: 64, lineHeight: 72, fontWeight: '800', textAlign: 'center' },
  of: { ...typography.title },
  row: { flexDirection: 'row', gap: spacing.md },
  step: { flex: 1 },
});
