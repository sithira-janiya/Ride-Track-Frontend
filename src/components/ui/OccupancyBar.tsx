import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const known = passengerCount != null && !!capacity;
  const target = known ? Math.min(occupancyLevel(passengerCount, capacity).ratio, 1) * 100 : 0;
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [target, width]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  if (!known) {
    return <Text style={[styles.text, { color: c.textSecondary }]}>{t('Occupancy not available')}</Text>;
  }
  const { label, tone } = occupancyLevel(passengerCount, capacity);
  return (
    <View accessible accessibilityLabel={`${t(label)}, ${t('{count} of {capacity} passengers', { count: passengerCount, capacity })}`} style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: c.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: c[tone] }, fillStyle]} />
      </View>
      <Text style={[styles.text, { color: c.text }]}>
        {EMOJI[tone]} {t(label)} · {passengerCount}/{capacity}
      </Text>
    </View>
  );
}

const EMOJI = { success: '🪑', warning: '👥', danger: '🚫' } as const;

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  track: { height: 10, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  text: { ...typography.caption },
});
