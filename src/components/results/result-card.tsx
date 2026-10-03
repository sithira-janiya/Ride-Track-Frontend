import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { FacilityChips } from '@/components/trip/facility-chips';
import { StatusPill } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { formatDuration, formatFare, toClock, toMinutes } from '@/lib/format';
import type { TripResult } from '@/types/models';

type Props = {
  result: TripResult;
  /** Opens Transport Details for this trip. */
  onPress?: () => void;
};

/** One trip in the Results list, laid out like the prototype: name and status, times with a duration pill, fare, seats and facilities. */
export function ResultCard({ result, onPress }: Props) {
  const { schedule, route, vehicle } = result;
  const option = transportOptions[route.type];
  const arrival = toClock(toMinutes(schedule.departure) + schedule.durationMinutes);

  return (
    <SurfaceCard
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`${route.name}, ${route.from} to ${route.to}, departs ${schedule.departure}. Open details`}
    >
      <View style={styles.top}>
        <View style={styles.icon}>
          <Ionicons name={option.icon} size={20} color={option.color} />
        </View>
        <View style={styles.titleBlock}>
          <Text variant="titleMedium" style={styles.bold} numberOfLines={1}>
            {vehicle?.number ?? route.name}
          </Text>
          <Text variant="bodySmall" style={styles.muted} numberOfLines={1}>
            {route.from} to {route.to}
          </Text>
        </View>
        <StatusPill status={schedule.status} />
      </View>

      <View style={styles.times}>
        <Text variant="titleLarge" style={styles.bold}>
          {schedule.departure}
        </Text>
        <View style={styles.line} />
        <View style={styles.durationPill}>
          <Text variant="labelMedium" style={styles.durationText}>
            {formatDuration(schedule.durationMinutes)}
          </Text>
        </View>
        <View style={styles.line} />
        <Text variant="titleLarge" style={styles.bold}>
          {arrival}
        </Text>
      </View>

      {vehicle ? <FacilityChips facilities={vehicle.facilities} compact /> : null}

      <View style={styles.bottom}>
        <Text variant="titleMedium" style={styles.fare}>
          {formatFare(route.fare)}
        </Text>
        <Text variant="bodySmall" style={styles.seats}>
          {schedule.seatsAvailable} seats
        </Text>
        <View style={styles.spacer} />
        <Text variant="labelLarge" style={styles.link}>
          View details
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  times: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  durationPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  durationText: { color: colors.primary, fontWeight: '600' },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  spacer: { flex: 1 },
  bold: { fontWeight: '700' },
  muted: { color: colors.textMuted },
  fare: { color: colors.primaryDark, fontWeight: '800' },
  seats: { color: colors.success, fontWeight: '600' },
  link: { color: colors.primary },
});
