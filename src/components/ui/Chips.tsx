import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

type Option<T> = { value: T; label: string };
type Props<T> = { label: string; options: Option<T>[]; value: T; onChange: (v: T) => void };

/** A single-choice chip row (radio group): big touch targets, selection shown by fill and checked state. */
export function Chips<T extends string | number | undefined>({ label, options, value, onChange }: Props<T>) {
  const c = useColors();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={[styles.chip, { backgroundColor: selected ? c.primary : c.background, borderColor: selected ? c.primary : c.border }]}>
            <Text style={[styles.text, { color: selected ? c.onPrimary : c.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: minTouchTarget, justifyContent: 'center', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md },
  text: { ...typography.body, fontWeight: '600' },
});
