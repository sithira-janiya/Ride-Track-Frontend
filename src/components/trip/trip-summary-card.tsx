import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { StatusPill } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import type { TripDetail } from '@/types/models';

/** Vehicle name, status, route and travel date at the top of the trip screens. */
export function TripSummaryCard({ detail, dateLabel }: { detail: TripDetail; dateLabel?: string }) {
  const option = transportOptions[detail.route.type];
  return (
    <SurfaceCard style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={option.icon} size={30} color={option.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="titleLarge" style={styles.title} numberOfLines={1}>
            {detail.vehicle.number}
          </Text>
          <StatusPill status={detail.schedule.status} />
        </View>
        <Text variant="bodyMedium" style={styles.muted}>
          {detail.route.from} → {detail.route.to}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          {detail.route.name}
          {dateLabel ? ` · ${dateLabel}` : ''}
        </Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontWeight: '700', flexShrink: 1 },
  muted: { color: colors.textMuted },
});
