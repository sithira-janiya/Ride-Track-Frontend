import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { StatTile as Tile } from '@/components/ops/StatTile';
import { VehicleCard } from '@/components/ops/VehicleCard';
import { Button, Card, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, ScreenHeader, StatusBadge } from '@/components/ui';
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
          <ScreenHeader title="Operations" emoji="📊" subtitle={user?.name ? `👋 ${user.name}` : undefined} />

          {ops.isPending ? (
            <Loading label="Loading live data…" emoji="📡" />
          ) : ops.isError ? (
            <ErrorMessage message={errorMessage(ops.error)} onRetry={() => ops.refetch()} />
          ) : (
            <>
              <View style={styles.tiles}>
                <Tile index={0} emoji="🚌" label="Vehicles live" value={String(d!.vehicles.length)} />
                <Tile index={1} emoji="⏰" label="Active delays" value={String(d!.activeDelays.length)} />
                <Tile index={2} emoji="👥" label="Passengers on board" value={String(d!.occupancy.totalPassengers)} hint={pct != null ? `${pct}% of seats` : undefined} />
                <Tile index={3} emoji="🈵" label="Nearly full" value={String(d!.occupancy.fullVehicles)} hint="90% or more" />
              </View>

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                🚨 Active delays and cancellations
              </Text>
              {d!.activeDelays.length === 0 ? (
                <EmptyState emoji="😎" title="All running normally" message="No delays or cancellations in the last 12 hours." />
              ) : (
                d!.activeDelays.map((a, i) => (
                  <FadeInView key={a.alertId} index={i}>
                    <Card>
                      <View style={styles.row}>
                        <Emoji symbol={a.type === 'CANCELLATION' ? '❌' : '⏰'} size={20} />
                        <StatusBadge label={a.type === 'CANCELLATION' ? 'Cancelled' : 'Delay'} tone={a.type === 'CANCELLATION' ? 'danger' : 'warning'} />
                      </View>
                      <Text style={[styles.body, { color: c.text }]}>{a.message}</Text>
                      {a.delayMinutes ? <Text style={[styles.caption, { color: c.textSecondary }]}>About {a.delayMinutes} minutes late</Text> : null}
                    </Card>
                  </FadeInView>
                ))
              )}

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                🚍 Vehicles
              </Text>
              {d!.vehicles.length === 0 ? (
                <EmptyState emoji="📭" title="No vehicles reporting" message="No vehicle is sending its position right now." />
              ) : (
                d!.vehicles.map((v, i) => (
                  <FadeInView key={v.vehicleId} index={i}>
                    <VehicleCard vehicle={v} />
                  </FadeInView>
                ))
              )}
            </>
          )}

          <Button title="Log out" emoji="👋" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  section: { ...typography.title, marginTop: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.caption },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
