import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Text } from 'react-native-paper';

import { RouteTimeline } from '@/components/trip/route-timeline';
import { TripSummaryCard } from '@/components/trip/trip-summary-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { useTripDetail } from '@/hooks/use-trip-detail';
import { formatDate, fromISODate } from '@/lib/format';
import { getTripProgress } from '@/lib/trip-progress';
import { useSavedRoutesStore } from '@/store/saved-routes-store';

export default function RouteAndStopsScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();

  const { detail, loading } = useTripDetail(id);
  const progress = useMemo(() => {
    if (!detail) return null;
    const now = new Date();
    return getTripProgress(detail, now.getHours() * 60 + now.getMinutes());
  }, [detail]);

  const routeId = detail?.route.id ?? '';
  const saved = useSavedRoutesStore((s) => s.routeIds.includes(routeId));
  const toggleRoute = useSavedRoutesStore((s) => s.toggleRoute);

  if (loading) {
    return (
      <Screen title="Route & Stops" back>
        <ActivityIndicator style={styles.loading} accessibilityLabel="Loading trip" />
      </Screen>
    );
  }

  if (!detail || !progress) {
    return (
      <Screen title="Route & Stops" back>
        <Text variant="titleMedium">We could not find this trip</Text>
        <Text style={styles.muted}>It may have been removed. Go back and search again.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Route & Stops"
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

      <SurfaceCard style={styles.location}>
        <View style={styles.pin}>
          <Ionicons name="location" size={20} color={colors.primary} />
        </View>
        <View style={styles.locationText}>
          <Text variant="labelMedium" style={styles.label}>
            CURRENT LOCATION
          </Text>
          <Text variant="titleSmall" style={styles.bold}>
            {progress.summary}
          </Text>
          {progress.phase === 'in-progress' && progress.nextStopName && progress.etaMinutes !== undefined ? (
            <Text variant="bodySmall" style={styles.muted}>
              Next stop {progress.nextStopName} in about {progress.etaMinutes} min
            </Text>
          ) : null}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.timeline}>
        <SectionHeader title="Route timeline" hint={`${detail.stopTimes.length} stops, ${detail.route.from} to ${detail.route.to}`} />
        <RouteTimeline stopTimes={detail.stopTimes} states={progress.stopStates} />
      </SurfaceCard>

      <Button
        mode="contained"
        icon="crosshairs-gps"
        buttonColor={colors.primaryDark}
        onPress={() => router.push({ pathname: '/(passenger)/track/[id]', params: { id: detail.schedule.id } })}
      >
        Track Vehicle Live
      </Button>
      <Text variant="bodySmall" style={styles.muted}>
        Times come from the timetable. Live GPS positions arrive with the tracking screen and the backend.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xl },
  location: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pin: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: { flex: 1, gap: 2 },
  timeline: { gap: spacing.sm },
  label: { color: colors.textMuted, letterSpacing: 0.6 },
  bold: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
