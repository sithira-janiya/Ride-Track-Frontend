import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

import { Button } from './Button';
import { illustrations, type IllustrationName } from './illustrations';
import { Emoji } from './motion';

type Props = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Decorative picture above the title; hidden from screen readers. */
  illustration?: IllustrationName;
  /** Decorative emoji shown when there is no illustration. */
  emoji?: string;
};

export function EmptyState({ title, message, actionLabel, onAction, illustration, emoji = '🌤️' }: Props) {
  const c = useColors();
  const t = useT();
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={styles.wrap}>
      {illustration ? (
        <Animated.View entering={ZoomIn.duration(450).delay(80)}>
          <Image source={illustrations[illustration]} style={styles.art} contentFit="contain" accessibilityLabel="" />
        </Animated.View>
      ) : (
        <Emoji symbol={emoji} size={52} motion="float" />
      )}
      <Text style={[styles.title, { color: c.text }]}>{t(title)}</Text>
      {message ? <Text style={[styles.msg, { color: c.textSecondary }]}>{t(message)}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  art: { width: 200, height: 140 },
  title: { ...typography.title, textAlign: 'center' },
  msg: { ...typography.body, textAlign: 'center' },
});
