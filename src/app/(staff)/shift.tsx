import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { Button, Card, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, ScreenHeader, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { useShift } from '@/store/shift';
import { spacing, typography } from '@/theme';
import { formatClock, modeEmoji, modeLabel } from '@/utils/format';

/** Choose the vehicle and trip for this shift (FR7). Passenger counts are reported against it. */
export default function ShiftScreen() {
  const c = useColors();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { shift, start, end } = useShift();
  const [routeId, setRouteId] = useState<number | null>(null);

  const routes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const route = routes.data?.find((r) => r.routeId === routeId);

  // trips are listed from the route's first stop, which is where a shift starts
  const detail = useQuery({ queryKey: ['route', routeId], queryFn: () => routesApi.detail(routeId!), enabled: routeId != null });
  const firstStopId = detail.data?.stops[0]?.stopId;
  const trips = useQuery({
    queryKey: ['arrivals', routeId, firstStopId],
    queryFn: () => routesApi.arrivals(routeId!, firstStopId!),
    enabled: firstStopId != null,
  });
  // a trip with no vehicle yet cannot report passengers
  const assignable = (trips.data ?? []).filter((t) => t.vehicleId != null && t.status !== 'CANCELLED' && t.status !== 'COMPLETED');

  const signOut = async () => {
    disconnectSocket();
    await logout();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ScreenHeader title="Shift" emoji="🕒" emojiMotion="pop" />
          <Card>
            <Text style={[styles.name, { color: c.text }]}>👷 {user?.name}</Text>
            <Text style={[styles.body, { color: c.textSecondary }]}>{user?.email ?? user?.phone}</Text>
          </Card>

          {shift ? (
            <FadeInView key={shift.tripId}>
              <Card style={{ borderColor: c.success, borderWidth: 2 }}>
                <View style={styles.onShift}>
                  <StatusBadge label="On shift" tone="success" />
                  <Emoji symbol="🟢" size={14} motion="pulse" />
                </View>
                <Text style={[styles.name, { color: c.text }]}>
                  Route {shift.routeNo} · Vehicle {shift.vehicleId}
                </Text>
                <Text style={[styles.body, { color: c.textSecondary }]}>Trip {shift.tripId}</Text>
                <Button title="End shift" emoji="🏁" variant="secondary" onPress={end} />
              </Card>
            </FadeInView>
          ) : (
            <Text style={[styles.body, { color: c.textSecondary }]}>Pick your route and trip to start a shift.</Text>
          )}

          <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
            {shift ? '🔁 Change shift' : '🚦 Start a shift'}
          </Text>
          {routes.isPending ? (
            <Loading label="Loading routes…" emoji="🗺️" />
          ) : routes.isError ? (
            <ErrorMessage message={errorMessage(routes.error)} onRetry={() => routes.refetch()} />
          ) : (
            <View style={styles.list}>
              {routes.data.map((r, i) => (
                <FadeInView key={r.routeId} index={i}>
                  <Button
                    title={`${r.routeNo} · ${r.name} (${modeLabel(r.mode)})`}
                    emoji={modeEmoji(r.mode)}
                    variant={r.routeId === routeId ? 'primary' : 'secondary'}
                    onPress={() => setRouteId(r.routeId)}
                  />
                </FadeInView>
              ))}
            </View>
          )}

          {route ? (
            <>
              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                🕒 Trips on {route.routeNo}
              </Text>
              {trips.isPending || detail.isPending ? (
                <Loading label="Loading trips…" emoji="🕒" />
              ) : trips.isError ? (
                <ErrorMessage message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
              ) : assignable.length === 0 ? (
                <EmptyState emoji="🚧" title="No trips with a vehicle" message="No trip on this route has a vehicle assigned right now." />
              ) : (
                <View style={styles.list}>
                  {assignable.map((t, i) => (
                    <FadeInView key={t.tripId} index={i}>
                      <Button
                        emoji="🎫"
                        title={`Trip ${t.tripId} · vehicle ${t.vehicleId} · ${formatClock(t.eta)}`}
                        variant={shift?.tripId === t.tripId ? 'primary' : 'secondary'}
                        onPress={() => start({ routeId: route.routeId, routeNo: route.routeNo, tripId: t.tripId, vehicleId: t.vehicleId! })}
                      />
                    </FadeInView>
                  ))}
                </View>
              )}
            </>
          ) : null}

          <Button title="Log out" emoji="👋" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  section: { ...typography.title, marginTop: spacing.sm },
  name: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  list: { gap: spacing.sm },
  onShift: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
