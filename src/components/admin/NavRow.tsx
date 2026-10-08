import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

/** A full-width menu row that opens another screen. */
export function NavRow({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}>
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
  text: { flex: 1 },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  detail: { ...typography.caption },
  chevron: { fontSize: 32, lineHeight: 36, fontWeight: '300' },
});
