import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

/** Section heading with an emoji in front. The emoji sits outside the translated text and is hidden from screen readers. */
export function SectionTitle({ title, emoji }: { title: string; emoji?: string }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.row}>
      {emoji ? (
        <Text accessible={false} accessibilityElementsHidden importantForAccessibility="no" maxFontSizeMultiplier={1.2} style={styles.emoji}>
          {emoji}
        </Text>
      ) : null}
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {t(title)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  emoji: { fontSize: 22, lineHeight: 28 },
  title: { ...typography.title, flexShrink: 1 },
});
