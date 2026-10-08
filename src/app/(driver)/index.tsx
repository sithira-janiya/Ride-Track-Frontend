import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { TripActions } from '@/components/driver/TripActions';
import { PassengerCounter } from '@/components/ops/PassengerCounter';
import { TripCard } from '@/components/routes/TripCard';
import { Button, Card, EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { driverSignOut, useDriverMe, useDriverOccupancy, useSetDuty } from '@/hooks/use-driver';
import { useNow } from '@/hooks/use-live-vehicles';
import { useT } from '@/i18n';
import { useLocationShare } from '@/store/location-share';
import { spacing, typography } from '@/theme';
import { timeAgo } from '@/utils/format';

/** The driver's home: their bus, going on and off duty (which starts and stops sharing its location), the trip, occupancy. */
export default function DriverHome() {
  const c = useColors();
  const router = useRouter();
  const me = useDriverMe();
  const duty = useSetDuty();
  const occupancy = useDriverOccupancy();

  const d = me.data;
  const running = d?.trip?.status === 'ONGOING' || d?.trip?.status === 'DELAYED';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            My bus
          </Text>

          {!d && me.isPending ? (
            <Loading label="Loading your bus…" />
          ) : !d ? (
            <ErrorMessage message={errorMessage(me.error)} onRetry={() => me.refetch()} />
          ) : (
            <>
              <Card>
                <Text style={[styles.name, { color: c.text }]}>{d.name}</Text>
                <Text style={[styles.body, { color: c.textSecondary }]}>
                  Driver code {d.driverCode} · Licence {d.licenseNo}
                </Text>
              </Card>

              {!d.bus || !d.route ? (
                <EmptyState
                  title="No bus assigned yet"
                  message="Ask your administrator to assign you a bus. You cannot go on duty until then."
                  actionLabel="Check again"
                  onAction={() => me.refetch()}
                />
              ) : (
                <>
                  <View>
                    <Text style={[styles.title, { color: c.text }]}>Bus {d.bus.regNo}</Text>
                    <Text style={[styles.body, { color: c.textSecondary }]}>
                      Route {d.route.routeNo} · {d.route.name}
                    </Text>
                  </View>

                  <Card style={{ borderColor: d.onDuty ? c.success : c.border }}>
                    <StatusBadge label={d.onDuty ? 'On duty' : 'Off duty'} tone={d.onDuty ? 'success' : 'warning'} />
                    <Text style={[styles.body, { color: c.text }]}>
                      {d.onDuty
                        ? 'Passengers can see your bus live. Keep RideTrack open on this phone while you drive.'
                        : 'Go on duty when you start driving. This phone then shares the bus location with passengers.'}
                    </Text>
                    {d.onDuty ? <SharingStatus /> : null}
                    {duty.isError ? <ErrorMessage message={errorMessage(duty.error)} /> : null}
                    <Button
                      title={d.onDuty ? 'Go off duty' : 'Go on duty'}
                      variant={d.onDuty ? 'secondary' : 'primary'}
                      loading={duty.isPending}
                      onPress={() => duty.mutate(!d.onDuty)}
                    />
                  </Card>

                  {d.trip ? (
                    <TripCard trip={d.trip} title={running ? 'Current trip' : 'Next trip'} highlighted={running}>
                      <TripActions trip={d.trip} />
                    </TripCard>
                  ) : (
                    <Card>
                      <Text style={[styles.body, { color: c.text }]}>Your bus has no trip running or coming up today.</Text>
                    </Card>
                  )}
                  <Button title="All trips and passengers" variant="secondary" onPress={() => router.navigate('/trips')} />

                  <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
                    Passengers on board
                  </Text>
                  <PassengerCounter
                    count={d.live?.passengerCount}
                    capacity={d.bus.capacity}
                    onSave={occupancy.mutate}
                    saving={occupancy.isPending}
                    saved={occupancy.isSuccess}
                    error={occupancy.isError ? errorMessage(occupancy.error) : null}
                    onEdit={occupancy.reset}
                  />
                </>
              )}
            </>
          )}

          <Button title="Log out" variant="secondary" onPress={driverSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Whether this phone is getting a GPS fix and the server is taking it. */
function SharingStatus() {
  const c = useColors();
  const t = useT();
  const now = useNow();
  const { status, lastSentAt, error } = useLocationShare();

  if (status === 'denied') {
    return <ErrorMessage message="Location access is off. Allow it in your phone settings, then go off and on duty again, so passengers can see the bus." />;
  }
  if (status === 'error') return <ErrorMessage message={error ?? 'Could not get this phone’s location. Check that GPS is on.'} />;
  return (
    <View style={styles.sharing}>
      <Text style={[styles.caption, { color: c.textSecondary }]}>
        {status === 'asking' ? 'Asking for location access…' : lastSentAt ? `Location sent ${timeAgo(now - lastSentAt, t)}` : 'Waiting for GPS…'}
      </Text>
      {error ? <Text style={[styles.caption, { color: c.warning }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  title: { ...typography.title },
  name: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  caption: { ...typography.caption },
  sharing: { gap: spacing.xs },
});
