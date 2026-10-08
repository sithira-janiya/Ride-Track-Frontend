import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi, vehiclesApi } from '@/api/endpoints';
import { PassengerCounter } from '@/components/ops/PassengerCounter';
import { Button, EmptyState, ErrorMessage, Loading } from '@/components/ui';
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

  const save = useMutation({
    mutationFn: (count: number) => vehiclesApi.setOccupancy(shift!.vehicleId, count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles', shift?.routeId] }),
  });

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
          ) : !vehicle ? (
            <EmptyState title="Vehicle not found" message="This vehicle is not reporting on the route. Check your shift." />
          ) : (
            <>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Route {shift.routeNo} · {vehicle.regNo ?? `Vehicle ${vehicle.vehicleId}`}
              </Text>
              <PassengerCounter
                count={vehicle.passengerCount}
                capacity={vehicle.capacity ?? 0}
                onSave={save.mutate}
                saving={save.isPending}
                saved={save.isSuccess}
                error={save.isError ? errorMessage(save.error) : null}
                onEdit={save.reset}
              />
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
});
