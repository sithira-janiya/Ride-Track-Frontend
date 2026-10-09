import { StyleSheet, Text } from 'react-native';
import Animated, { BounceIn, ZoomIn } from 'react-native-reanimated';

import { Button, Emoji } from '@/components/ui';
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
    <Animated.View entering={ZoomIn.springify().damping(14)} accessibilityLiveRegion="assertive" style={[styles.panel, { backgroundColor: bg, borderColor: fg }]}>
      <Animated.View entering={BounceIn.delay(120)} style={[styles.badge, { borderColor: fg }]}>
        <Text accessibilityElementsHidden maxFontSizeMultiplier={1.2} style={[styles.icon, { color: fg }]}>
          {valid ? '✓' : '✕'}
        </Text>
      </Animated.View>
      <Text accessibilityRole="header" maxFontSizeMultiplier={1.2} style={[styles.verdict, { color: fg }]}>
        {valid ? 'VALID' : 'INVALID'}
      </Text>
      <Text style={[styles.reason, { color: c.text }]}>{valid ? 'Ticket accepted. Let the passenger board.' : outcome.reason ?? 'This ticket cannot be accepted.'}</Text>
      <Emoji symbol={valid ? '🎉' : '🚫'} size={32} motion={valid ? 'float' : 'pulse'} />
      <Button title="Scan next ticket" emoji="📷" onPress={onNext} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', gap: spacing.sm, borderWidth: 3, borderRadius: 20, padding: spacing.lg },
  badge: { width: 112, height: 112, borderRadius: 56, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 72, lineHeight: 80, fontWeight: '800' },
  verdict: { fontSize: 44, lineHeight: 52, fontWeight: '800' },
  reason: { ...typography.bodyLarge, textAlign: 'center', marginBottom: spacing.sm },
});
