import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { radius, spacing, typography } from '@/theme';

type Props = { passengerCount?: number; capacity?: number };

export function occupancyLevel(count: number, capacity: number) {
  const ratio = capacity > 0 ? count / capacity : 0;
  if (ratio >= 0.9) return { ratio, label: 'Full', tone: 'danger' as const };
  if (ratio >= 0.6) return { ratio, label: 'Busy', tone: 'warning' as const };
  return { ratio, label: 'Seats available', tone: 'success' as const };
}

/** Shows how full a vehicle is, with a text fallback when no count is reported (FR7). */
export function OccupancyBar({ passengerCount, capacity }: Props) {
  const c = useColors();
  const t = useT();
  if (passengerCount == null || !capacity) {
    return <Text style={[styles.text, { color: c.textSecondary }]}>{t('Occupancy not available')}</Text>;
  }
  const { ratio, label, tone } = occupancyLevel(passengerCount, capacity);
  return (
    <View accessible accessibilityLabel={`${t(label)}, ${t('{count} of {capacity} passengers', { count: passengerCount, capacity })}`} style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <View style={[styles.fill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: c[tone] }]} />
      </View>
      <Text style={[styles.text, { color: c.text }]}>
        {t(label)} · {passengerCount}/{capacity}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  text: { ...typography.caption },
});
