import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import { FacilityChips } from '@/components/trip/facility-chips';
import { RouteTimeline } from '@/components/trip/route-timeline';
import { TripSummaryCard } from '@/components/trip/trip-summary-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDate, formatDuration, formatFare, fromISODate, toClock, toMinutes } from '@/lib/format';
import { getTripDetail } from '@/lib/trip-data';
import { getTripProgress } from '@/lib/trip-progress';
import { useSavedRoutesStore } from '@/store/saved-routes-store';

export default function TransportDetailsScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();

  const detail = useMemo(() => getTripDetail(id), [id]);
  const progress = useMemo(() => {
    if (!detail) return null;
    const now = new Date();
    return getTripProgress(detail, now.getHours() * 60 + now.getMinutes());
  }, [detail]);

  const routeId = detail?.route.id ?? '';
  const saved = useSavedRoutesStore((s) => s.routeIds.includes(routeId));
  const toggleRoute = useSavedRoutesStore((s) => s.toggleRoute);

  if (!detail || !progress) {
    return (
      <Screen title="Transport Details" back>
        <Text variant="titleMedium">We could not find this trip</Text>
        <Text style={styles.muted}>It may have been removed. Go back and search again.</Text>
      </Screen>
    );
  }

  const { schedule, route, vehicle, stopTimes } = detail;
  const arrival = toClock(toMinutes(schedule.departure) + schedule.durationMinutes);

  return (
    <Screen
      title="Transport Details"
      back
      headerRight={
        <IconButton
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          iconColor={colors.onNavy}
          accessibilityLabel={saved ? 'Remove this route from saved routes' : 'Save this route'}
          onPress={() => toggleRoute(routeId)}
        />
      }
    >
      <TripSummaryCard detail={detail} dateLabel={formatDate(fromISODate(date))} />

      <SurfaceCard style={styles.journey}>
        <Text variant="labelMedium" style={styles.label}>
          JOURNEY INFORMATION
        </Text>
        <View style={styles.times}>
          <View style={styles.timeBlock}>
            <Text variant="headlineSmall" style={styles.bold}>
              {schedule.departure}
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              {route.from}
            </Text>
          </View>
          <View style={styles.durationPill}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text variant="labelMedium" style={styles.durationText}>
              {formatDuration(schedule.durationMinutes)}
            </Text>
          </View>
          <View style={[styles.timeBlock, styles.timeEnd]}>
            <Text variant="headlineSmall" style={styles.bold}>
              {arrival}
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              {route.to}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.facts}>
          <View style={styles.fact}>
            <Text variant="labelMedium" style={styles.muted}>
              Fare
            </Text>
            <Text variant="titleLarge" style={styles.fare}>
              {formatFare(route.fare)}
            </Text>
          </View>
          <View style={styles.fact}>
            <Text variant="labelMedium" style={styles.muted}>
              Available seats
            </Text>
            <Text variant="titleLarge" style={styles.seats}>
              {schedule.seatsAvailable} seats
            </Text>
          </View>
        </View>
      </SurfaceCard>

      {vehicle.facilities.length > 0 ? (
        <SurfaceCard style={styles.block}>
          <Text variant="labelMedium" style={styles.label}>
            FACILITIES
          </Text>
          <FacilityChips facilities={vehicle.facilities} />
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.block}>
        <View style={styles.stopsHeader}>
          <SectionHeader title="Route & Stops" hint={progress.summary} />
        </View>
        <RouteTimeline stopTimes={stopTimes} states={progress.stopStates} />
        <Button mode="text" onPress={() => router.push({ pathname: '/(passenger)/route/[id]', params: { id: schedule.id, date } })}>
          View full route
        </Button>
      </SurfaceCard>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="crosshairs-gps"
          onPress={() => router.push({ pathname: '/(passenger)/track/[id]', params: { id: schedule.id } })}
        >
          Track Vehicle
        </Button>
        <Button mode="contained" buttonColor={colors.primaryDark} disabled>
          Book Ticket
        </Button>
        <Text variant="bodySmall" style={styles.muted}>
          Booking opens when the booking screens are ready.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  journey: { gap: spacing.md },
  label: { color: colors.textMuted, letterSpacing: 0.6 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  timeBlock: { flex: 1, gap: 2 },
  timeEnd: { alignItems: 'flex-end' },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  durationText: { color: colors.primary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border },
  facts: { flexDirection: 'row' },
  fact: { flex: 1, gap: 2 },
  block: { gap: spacing.sm },
  stopsHeader: { marginBottom: spacing.xs },
  actions: { gap: spacing.sm },
  bold: { fontWeight: '700' },
  fare: { fontWeight: '800', color: colors.primaryDark },
  seats: { fontWeight: '700', color: colors.success },
  muted: { color: colors.textMuted },
});
