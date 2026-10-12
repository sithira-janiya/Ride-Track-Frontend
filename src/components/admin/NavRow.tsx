import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

type Props = {
  title: string;
  detail: string;
  onPress: () => void;
  /** Emoji in a tinted bubble before the title; decorative, hidden from screen readers. */
  icon?: string;
};

/** A full-width menu row that opens another screen. */
export function NavRow({ title, detail, onPress, icon }: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
      {icon ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.icon, { backgroundColor: `${c.primary}24` }]}>
          <Text maxFontSizeMultiplier={1.2} style={styles.emoji}>
            {icon}
          </Text>
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={[styles.detail, { color: c.textSecondary }]}>{detail}</Text>
      </View>
      <Text importantForAccessibility="no" style={[styles.chevron, { color: c.primary }]}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchTarget + 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, lineHeight: 28 },
  text: { flex: 1 },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  detail: { ...typography.caption },
  chevron: { fontSize: 32, lineHeight: 36, fontWeight: '300' },
});
