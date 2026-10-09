import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

import { Emoji } from './motion';

type Props = {
  /** already translated: the caller passes t('…') so placeholders work */
  title: string;
  emoji?: string;
  emojiMotion?: 'float' | 'wave' | 'pulse' | 'pop';
  subtitle?: string;
  /** shown at the right end of the title row, e.g. a badge */
  right?: ReactNode;
  size?: 'large' | 'medium';
};

/** Screen title with a decorative emoji that drops in with the heading. */
export function ScreenHeader({ title, emoji, emojiMotion = 'pop', subtitle, right, size = 'large' }: Props) {
  const c = useColors();
  return (
    <Animated.View entering={FadeInDown.duration(380)} style={styles.wrap}>
      <View style={styles.row}>
        {emoji ? <Emoji symbol={emoji} size={size === 'large' ? 30 : 24} motion={emojiMotion} /> : null}
        <Text accessibilityRole="header" style={[size === 'large' ? styles.large : styles.medium, styles.title, { color: c.text }]}>
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flexShrink: 1, flexGrow: 1 },
  large: { ...typography.heading },
  medium: { ...typography.title },
  subtitle: { ...typography.body },
});
