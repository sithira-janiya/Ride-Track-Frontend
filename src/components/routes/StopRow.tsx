import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Emoji, PressableScale } from '@/components/ui';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { Stop } from '@/types';
import { formatFare } from '@/utils/format';

type Props = { stop: Stop; selected?: boolean; onPress: () => void; /** position in the list, staggers the entrance */ index?: number };

/** One stop in the route's ordered list. Tapping it selects the stop for upcoming arrivals. */
export function StopRow({ stop, selected, onPress, index = 0 }: Props) {
  const c = useColors();
  const t = useT();
  return (
    <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 10) * 35)}>
      <PressableScale
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityState={{ selected: !!selected }}
        accessibilityLabel={`${t('Stop {n}', { n: stop.stopSequence ?? '' })}, ${stop.name}${stop.fareFromOrigin != null ? `, ${t('fare {fare}', { fare: formatFare(stop.fareFromOrigin) })}` : ''}${selected ? `, ${t('selected')}` : ''}`}
        onPress={onPress}
        style={[
          styles.row,
          { backgroundColor: selected ? c.infoBg : c.background, borderColor: selected ? c.primary : c.border },
        ]}>
        <View style={[styles.dot, { backgroundColor: selected ? c.primary : c.border }]}>
          <Text style={[styles.seq, { color: selected ? c.onPrimary : c.text }]}>{stop.stopSequence}</Text>
        </View>
        <Text style={[styles.name, { color: c.text }]}>{stop.name}</Text>
        {selected ? <Emoji symbol="📍" size={18} motion="pop" /> : null}
        {stop.fareFromOrigin != null ? (
          <Text style={[styles.fare, { color: c.textSecondary }]}>
            {stop.fareFromOrigin === 0 ? t('Start') : formatFare(stop.fareFromOrigin)}
          </Text>
        ) : null}
      </PressableScale>
    </Animated.View>
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
