import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

import { Button } from './Button';

type Props = { title: string; message?: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? <Text style={[styles.msg, { color: c.textSecondary }]}>{message}</Text> : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  title: { ...typography.title, textAlign: 'center' },
  msg: { ...typography.body, textAlign: 'center' },
});
