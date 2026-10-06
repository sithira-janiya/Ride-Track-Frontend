import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { ScanOutcome } from '@/types';

type Props = { outcome: ScanOutcome; onNext: () => void };

/** Full-width VALID / INVALID verdict, readable at arm's length: icon, word and colour together (NFR8). */
export function ScanResultPanel({ outcome, onNext }: Props) {
  const c = useColors();
  const valid = outcome.result === 'VALID';
  const fg = valid ? c.success : c.danger;
  const bg = valid ? c.successBg : c.dangerBg;
  return (
    <View accessibilityLiveRegion="assertive" style={[styles.panel, { backgroundColor: bg, borderColor: fg }]}>
      <Text accessibilityElementsHidden style={[styles.icon, { color: fg }]}>
        {valid ? '✓' : '✕'}
      </Text>
      <Text accessibilityRole="header" style={[styles.verdict, { color: fg }]}>
        {valid ? 'VALID' : 'INVALID'}
      </Text>
      <Text style={[styles.reason, { color: c.text }]}>{valid ? 'Ticket accepted. Let the passenger board.' : outcome.reason ?? 'This ticket cannot be accepted.'}</Text>
      <Button title="Scan next ticket" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: spacing.sm, borderWidth: 3, borderRadius: 20, padding: spacing.lg },
  icon: { fontSize: 72, lineHeight: 80, fontWeight: '800' },
  verdict: { fontSize: 44, lineHeight: 52, fontWeight: '800' },
  reason: { ...typography.bodyLarge, textAlign: 'center', marginBottom: spacing.sm },
});
