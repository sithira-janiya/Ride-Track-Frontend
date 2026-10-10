import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

import { Button } from './Button';
import { illustrations, type IllustrationName } from './illustrations';

type Props = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Decorative picture above the title; hidden from screen readers. */
  illustration?: IllustrationName;
};

export function EmptyState({ title, message, actionLabel, onAction, illustration }: Props) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.wrap}>
      {illustration ? <Image source={illustrations[illustration]} style={styles.art} contentFit="contain" accessibilityLabel="" /> : null}
      <Text style={[styles.title, { color: c.text }]}>{t(title)}</Text>
      {message ? <Text style={[styles.msg, { color: c.textSecondary }]}>{t(message)}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  art: { width: 200, height: 140 },
  title: { ...typography.title, textAlign: 'center' },
  msg: { ...typography.body, textAlign: 'center' },
});
