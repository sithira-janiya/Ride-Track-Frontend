import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const c = useColors();
  const t = useT();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={t(label)} style={styles.wrap}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={[styles.text, { color: c.textSecondary }]}>{t(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  text: { ...typography.body },
});
