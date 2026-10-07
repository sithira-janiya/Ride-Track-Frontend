import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { radius, spacing, typography } from '@/theme';

export type Tone = 'success' | 'danger' | 'warning' | 'info';

const ICON: Record<Tone, string> = { success: '✓', danger: '✕', warning: '!', info: 'i' };

type Props = { label: string; tone: Tone };

/** Status is conveyed by icon AND text, never colour alone (NFR8). */
export function StatusBadge({ label, tone }: Props) {
  const c = useColors();
  const t = useT();
  const fg = c[tone];
  const bg = c[`${tone}Bg` as const];
  return (
    <View accessible accessibilityLabel={t(label)} style={[styles.badge, { backgroundColor: bg, borderColor: fg }]}>
      <Text style={[styles.icon, { color: fg }]}>{ICON[tone]}</Text>
      <Text style={[styles.text, { color: fg }]}>{t(label)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  icon: { ...typography.caption, fontWeight: '800' },
  text: { ...typography.caption, fontWeight: '700' },
});
