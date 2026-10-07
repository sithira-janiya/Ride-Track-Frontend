import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { StatTile as Tile } from '@/components/ops/StatTile';
import { VehicleCard } from '@/components/ops/VehicleCard';
import { Button, Card, EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useOpsDashboard } from '@/hooks/use-ops';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { spacing, typography } from '@/theme';

export default function AuthorityDashboard() {
  const c = useColors();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const ops = useOpsDashboard();

  const signOut = async () => {
    disconnectSocket();
    await logout();
  };

  const d = ops.data;
  const pct = d && d.occupancy.totalCapacity > 0 ? Math.round((d.occupancy.totalPassengers / d.occupancy.totalCapacity) * 100) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Operations
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{user?.name}</Text>

          {ops.isPending ? (
            <Loading label="Loading live data…" />
          ) : ops.isError ? (
            <ErrorMessage message={errorMessage(ops.error)} onRetry={() => ops.refetch()} />
          ) : (
            <>
              <View style={styles.tiles}>
                <Tile label="Vehicles live" value={String(d!.vehicles.length)} />
                <Tile label="Active delays" value={String(d!.activeDelays.length)} />
                <Tile label="Passengers on board" value={String(d!.occupancy.totalPassengers)} hint={pct != null ? `${pct}% of seats` : undefined} />
                <Tile label="Nearly full" value={String(d!.occupancy.fullVehicles)} hint="90% or more" />
              </View>

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                Active delays and cancellations
              </Text>
              {d!.activeDelays.length === 0 ? (
                <EmptyState title="All running normally" message="No delays or cancellations in the last 12 hours." />
              ) : (
                d!.activeDelays.map((a) => (
                  <Card key={a.alertId}>
                    <StatusBadge label={a.type === 'CANCELLATION' ? 'Cancelled' : 'Delay'} tone={a.type === 'CANCELLATION' ? 'danger' : 'warning'} />
                    <Text style={[styles.body, { color: c.text }]}>{a.message}</Text>
                    {a.delayMinutes ? <Text style={[styles.caption, { color: c.textSecondary }]}>About {a.delayMinutes} minutes late</Text> : null}
                  </Card>
                ))
              )}

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                Vehicles
              </Text>
              {d!.vehicles.length === 0 ? (
                <EmptyState title="No vehicles reporting" message="No vehicle is sending its position right now." />
              ) : (
                d!.vehicles.map((v) => <VehicleCard key={v.vehicleId} vehicle={v} />)
              )}
            </>
          )}

          <Button title="Log out" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  section: { ...typography.title, marginTop: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.caption },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
