import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { radius, spacing, typography } from '@/theme';

import { Button } from './Button';
import { Emoji } from './motion';

type Props = { message: string; onRetry?: () => void };

/** Clear, non-technical error text (NFR7). Gives a small shake when it appears or the message changes. */
export function ErrorMessage({ message, onRetry }: Props) {
  const c = useColors();
  const t = useT();
  const x = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    x.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 70 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }, [message, reduced, x]);
  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(220)} accessibilityRole="alert" style={[styles.box, { backgroundColor: c.dangerBg, borderColor: c.danger }, shake]}>
      <View style={styles.row}>
        <Emoji symbol="😕" size={22} />
        <Text style={[styles.text, { color: c.danger }]}>{t(message)}</Text>
      </View>
      {onRetry ? <Button title="Try again" emoji="🔄" variant="secondary" onPress={onRetry} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  text: { ...typography.body, fontWeight: '600', flex: 1 },
});
