import { StyleSheet, Text, View } from 'react-native';

import { LoadingScene } from '@/components/loading/LoadingScene';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { radius, spacing, typography } from '@/theme';

/** In-screen loading state: a small looping street scene (decorative) above a line saying what is loading. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  const c = useColors();
  const t = useT();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={t(label)} style={styles.wrap}>
      <LoadingScene height={112} style={[styles.scene, { borderColor: c.border }]} />
      <Text style={[styles.text, { color: c.textSecondary }]}>{t(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  scene: { width: '100%', maxWidth: 320, borderRadius: radius.lg, borderWidth: 1 },
  text: { ...typography.body, textAlign: 'center' },
});
