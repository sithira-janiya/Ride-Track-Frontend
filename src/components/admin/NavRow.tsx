import { StyleSheet, Text, View } from 'react-native';

import { Emoji, PressableScale } from '@/components/ui';

import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

/** A full-width menu row that opens another screen. */
export function NavRow({ title, detail, emoji, onPress }: { title: string; detail: string; emoji?: string; onPress: () => void }) {
  const c = useColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.infoBg : c.surface, borderColor: pressed ? c.primary : c.border }]}>
      {emoji ? (
        <View style={[styles.icon, { backgroundColor: c.background }]}>
          <Emoji symbol={emoji} size={22} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Text style={[styles.detail, { color: c.textSecondary }]}>{detail}</Text>
      </View>
      <Text importantForAccessibility="no" style={[styles.chevron, { color: c.primary }]}>
        ›
      </Text>
    </PressableScale>
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
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  detail: { ...typography.caption },
  chevron: { fontSize: 32, lineHeight: 36, fontWeight: '300' },
});
