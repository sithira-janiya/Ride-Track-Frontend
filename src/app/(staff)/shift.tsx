import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useAllRoutes, useRouteTrips } from '@/features/routes/hooks/use-routes';
import { useShift } from '@/features/shift/stores/shift';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/store/auth';
import { spacing, typography } from '@/theme';
import { formatClock, modeLabel } from '@/utils/format';

/** Choose the vehicle and trip for this shift (FR7). Passenger counts are reported against it. */
export default function ShiftScreen() {
  const c = useColors();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { shift, start, end } = useShift();
  const [routeId, setRouteId] = useState<number | null>(null);

  const routes = useAllRoutes();
  const route = routes.data?.find((r) => r.routeId === routeId);

  const trips = useRouteTrips(routeId);
  // a trip with no vehicle yet cannot report passengers
  const assignable = trips.trips.filter((t) => t.vehicleId != null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Shift
          </Text>
          <Card>
            <Text style={[styles.name, { color: c.text }]}>{user?.name}</Text>
            <Text style={[styles.body, { color: c.textSecondary }]}>{user?.email ?? user?.phone}</Text>
          </Card>

          {shift ? (
            <Card style={{ borderColor: c.success }}>
              <StatusBadge label="On shift" tone="success" />
              <Text style={[styles.name, { color: c.text }]}>
                Route {shift.routeNo} · Vehicle {shift.vehicleId}
              </Text>
              <Text style={[styles.body, { color: c.textSecondary }]}>Trip {shift.tripId}</Text>
              <Button title="End shift" variant="secondary" onPress={end} />
            </Card>
          ) : (
            <Text style={[styles.body, { color: c.textSecondary }]}>Pick your route and trip to start a shift.</Text>
          )}

          <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
            {shift ? 'Change shift' : 'Start a shift'}
          </Text>
          {routes.isPending ? (
            <Loading label="Loading routes…" />
          ) : routes.isError ? (
            <ErrorMessage message={errorMessage(routes.error)} onRetry={() => routes.refetch()} />
          ) : (
            <View style={styles.list}>
              {routes.data.map((r) => (
                <Button
                  key={r.routeId}
                  title={`${r.routeNo} · ${r.name} (${modeLabel(r.mode)})`}
                  variant={r.routeId === routeId ? 'primary' : 'secondary'}
                  onPress={() => setRouteId(r.routeId)}
                />
              ))}
            </View>
          )}

          {route ? (
            <>
              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                Trips on {route.routeNo}
              </Text>
              {trips.isPending ? (
                <Loading label="Loading trips…" />
              ) : trips.error ? (
                <ErrorMessage message={errorMessage(trips.error)} onRetry={trips.refetch} />
              ) : assignable.length === 0 ? (
                <EmptyState title="No trips with a vehicle" message="No trip on this route has a vehicle assigned right now." />
              ) : (
                <View style={styles.list}>
                  {assignable.map((t) => (
                    <Button
                      key={t.tripId}
                      title={`Trip ${t.tripId} · vehicle ${t.vehicleId} · ${formatClock(t.eta)}`}
                      variant={shift?.tripId === t.tripId ? 'primary' : 'secondary'}
                      onPress={() => start({ routeId: route.routeId, routeNo: route.routeNo, tripId: t.tripId, vehicleId: t.vehicleId! })}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}

          <Button title="Log out" variant="secondary" onPress={logout} />
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
  section: { ...typography.title, marginTop: spacing.sm },
  name: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  list: { gap: spacing.sm },
});
