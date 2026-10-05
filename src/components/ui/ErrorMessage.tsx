import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';

import { Button } from './Button';

type Props = { message: string; onRetry?: () => void };

/** Clear, non-technical error text (NFR7). */
export function ErrorMessage({ message, onRetry }: Props) {
  const c = useColors();
  return (
    <View accessibilityRole="alert" style={[styles.box, { backgroundColor: c.dangerBg, borderColor: c.danger }]}>
      <Text style={[styles.text, { color: c.danger }]}>⚠ {message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  text: { ...typography.body, fontWeight: '600' },
});
