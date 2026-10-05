import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const c = useColors();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.wrap}>
      <ActivityIndicator size="large" color={c.primary} />
      <Text style={[styles.text, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  text: { ...typography.body },
});
