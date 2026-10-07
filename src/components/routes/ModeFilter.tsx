import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { TransportMode } from '@/types';

export type ModeValue = TransportMode | 'ALL';

const OPTIONS: { value: ModeValue; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BUS', label: 'Bus' },
  { value: 'TRAIN', label: 'Train' },
];

type Props = { value: ModeValue; onChange: (v: ModeValue) => void };

export function ModeFilter({ value, onChange }: Props) {
  const c = useColors();
  const t = useT();
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {OPTIONS.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(o.label)}
            onPress={() => onChange(o.value)}
            style={[
              styles.chip,
              { backgroundColor: selected ? c.primary : c.background, borderColor: selected ? c.primary : c.border },
            ]}>
            <Text style={[styles.text, { color: selected ? c.onPrimary : c.text }]}>{t(o.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    minHeight: minTouchTarget,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.body, fontWeight: '600' },
});
