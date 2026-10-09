import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

import { Emoji } from './motion';

export function Loading({ label = 'Loading…', emoji = '🚌' }: { label?: string; emoji?: string }) {
  const c = useColors();
  const t = useT();
  return (
    <Animated.View entering={FadeIn.duration(250)} accessibilityRole="progressbar" accessibilityLabel={t(label)} style={styles.wrap}>
      <Emoji symbol={emoji} size={36} motion="float" />
      <View style={styles.row}>
        <ActivityIndicator color={c.primary} />
        <Text style={[styles.text, { color: c.textSecondary }]}>{t(label)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { ...typography.body },
});
