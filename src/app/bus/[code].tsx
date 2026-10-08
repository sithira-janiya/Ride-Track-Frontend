import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorCode, errorMessage } from '@/api/client';
import { BusStatusCard } from '@/components/bus/BusStatusCard';
import { LiveMap } from '@/components/map/LiveMap';
import { TripCard } from '@/components/routes/TripCard';
import { Button, Card, EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useBus } from '@/hooks/use-bus';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { usePendingBus } from '@/store/pending-bus';
import { spacing, typography } from '@/theme';
import { modeLabel } from '@/utils/format';
import { nearestStop } from '@/utils/geo';

/**
 * The bus behind a scanned QR sticker (`rtexpo://bus/<code>`, or the in-app scanner). Open to everyone, signed in or not,
 * since a passenger may have just installed the app on the bus: where the bus is, its route and trip, and a ticket for it.
 */
export default function BusScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const code = String(useLocalSearchParams<{ code: string }>().code ?? '').toUpperCase();
  const role = useAuth((s) => s.user?.role);
  const { query, live } = useBus(code);
  const view = query.data;

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const near = view && live ? nearestStop(view.route.stops, live.lat, live.lng) : null;
  const canBuy = !!view?.trip && view.trip.status !== 'CANCELLED' && view.trip.status !== 'COMPLETED';

  const buy = () => {
    if (!view?.trip) return;
    router.push({
      pathname: '/buy/[routeId]',
      params: {
        routeId: String(view.route.routeId),
        tripId: String(view.trip.tripId),
        regNo: view.bus.regNo,
        // you board where the bus is now (the passenger can change it); nobody boards at the last stop
        ...(near && near.stopId !== view.route.stops.at(-1)?.stopId ? { boardStopId: String(near.stopId) } : {}),
      },
    });
  };
  // the passenger screens open this bus again once signed in (useOpenPendingBus); replace, so it is not in history twice
  const signIn = (path: '/login' | '/register') => {
    usePendingBus.getState().open(code, { afterLogin: true });
    router.replace(path);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Button title="← Back" variant="secondary" onPress={back} />

          {/* a failed background refresh keeps showing the last good data */}
          {!view && query.isPending ? (
            <Loading label="Finding your bus…" />
          ) : !view ? (
            errorCode(query.error) === 'BUS_NOT_FOUND' ? (
              <EmptyState
                illustration="routes"
                title="Bus code not recognised"
                message={errorMessage(query.error)}
                actionLabel={role === 'PASSENGER' ? 'Scan again' : undefined}
                onAction={() => router.replace('/scan')}
              />
            ) : (
              <ErrorMessage message={errorMessage(query.error)} onRetry={() => query.refetch()} />
            )
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
                    {t(view.bus.type === 'TRAIN' ? 'Train {regNo}' : 'Bus {regNo}', { regNo: view.bus.regNo })}
                  </Text>
                  <StatusBadge label={modeLabel(view.bus.type)} tone="info" />
                </View>
                <Text style={[styles.sub, { color: c.textSecondary }]}>
                  {t('Route {routeNo} · {name}', { routeNo: view.route.routeNo, name: view.route.name })}
                </Text>
              </View>

              <BusStatusCard live={live} stops={view.route.stops} sharing={view.driverOnDuty} />

              {/* the web build shows a short notice instead of a map, so it needs no fixed height */}
              <View style={Platform.OS === 'web' ? undefined : styles.map}>
                <LiveMap
                  stops={view.route.stops}
                  vehicles={live ? [live] : []}
                  mode={view.bus.type}
                  selectedVehicleId={view.bus.vehicleId}
                  onSelectVehicle={() => {}}
                />
              </View>

              {view.trip ? (
                <TripCard
                  trip={view.trip}
                  title={view.trip.status === 'ONGOING' || view.trip.status === 'DELAYED' ? 'Trip running now' : 'Next trip'}
                />
              ) : (
                <Card>
                  <Text style={[styles.body, { color: c.text }]}>{t('This bus has no trip running or coming up today.')}</Text>
                </Card>
              )}

              {role === 'PASSENGER' ? (
                <>
                  <Button title="Buy a ticket for this bus" onPress={buy} disabled={!canBuy} />
                  <Button
                    title="Route, stops and arrivals"
                    variant="secondary"
                    onPress={() => router.push({ pathname: '/route/[id]', params: { id: String(view.route.routeId) } })}
                  />
                </>
              ) : !role ? (
                <Card>
                  <Text style={[styles.body, { color: c.text }]}>{t('Log in or create an account to buy a ticket for this bus.')}</Text>
                  <Button title="Log in" onPress={() => signIn('/login')} />
                  <Button title="Create an account" variant="secondary" onPress={() => signIn('/register')} />
                </Card>
              ) : null}

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                {t('Stops')}
              </Text>
              <Card>
                {view.route.stops.map((s) => (
                  <View key={s.stopId} style={styles.stop}>
                    <Text style={[styles.body, { color: c.text, fontWeight: s.stopId === near?.stopId ? '700' : '400' }]}>
                      {s.stopSequence}. {s.name}
                    </Text>
                    {s.stopId === near?.stopId ? <StatusBadge label="Bus is here" tone="success" /> : null}
                  </View>
                ))}
              </Card>
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
  header: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  heading: { ...typography.heading, flexShrink: 1 },
  sub: { ...typography.body },
  body: { ...typography.body },
  section: { ...typography.title, marginTop: spacing.sm },
  map: { height: 260, borderRadius: 16, overflow: 'hidden' },
  stop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, minHeight: 32 },
});
