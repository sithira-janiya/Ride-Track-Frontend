import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { Stop } from '@/types';
import { formatFare } from '@/utils/format';

type Props = { stop: Stop; selected?: boolean; onPress: () => void };

/** One stop in the route's ordered list. Tapping it selects the stop for upcoming arrivals. */
export function StopRow({ stop, selected, onPress }: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`Stop ${stop.stopSequence}, ${stop.name}${stop.fareFromOrigin != null ? `, fare ${formatFare(stop.fareFromOrigin)}` : ''}${selected ? ', selected' : ''}`}
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: selected ? c.infoBg : c.background, borderColor: selected ? c.primary : c.border },
      ]}>
      <View style={[styles.dot, { backgroundColor: selected ? c.primary : c.border }]}>
        <Text style={[styles.seq, { color: selected ? c.onPrimary : c.text }]}>{stop.stopSequence}</Text>
      </View>
      <Text style={[styles.name, { color: c.text }]}>{stop.name}</Text>
      {stop.fareFromOrigin != null ? (
        <Text style={[styles.fare, { color: c.textSecondary }]}>
          {stop.fareFromOrigin === 0 ? 'Start' : formatFare(stop.fareFromOrigin)}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderRadius: radius.md,
  },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  seq: { ...typography.caption, fontWeight: '700' },
  name: { ...typography.body, fontWeight: '600', flex: 1 },
  fare: { ...typography.caption },
});
