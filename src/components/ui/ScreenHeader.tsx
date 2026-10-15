import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors, useRoleAccent } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography, type HeroTone } from '@/theme';

const ROLE_LABEL: Record<HeroTone, string> = { passenger: 'Passenger', staff: 'Staff', authority: 'Authority', admin: 'Admin' };

type Props = {
  tone: HeroTone;
  title: string;
  /** Fills `{placeholders}` in the title. */
  titleParams?: Record<string, string | number>;
  subtitle?: string;
  /** Fills `{placeholders}` in the subtitle. */
  subtitleParams?: Record<string, string | number>;
  /** Replaces the role name above the title. */
  eyebrow?: string;
  /** Shown to the right of the title, such as a small button. */
  action?: ReactNode;
};

/** Top of every tab screen that is not a role home: the role name in its accent colour, then the screen title. */
export function ScreenHeader({ tone, title, titleParams, subtitle, subtitleParams, eyebrow, action }: Props) {
  const c = useColors();
  const t = useT();
  const accent = useRoleAccent(tone);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.eyebrow, { color: accent }]}>{t(eyebrow ?? ROLE_LABEL[tone])}</Text>
      <View style={styles.row}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t(title, titleParams)}
        </Text>
        {action}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t(subtitle, subtitleParams)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  eyebrow: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.heading, flexShrink: 1 },
  subtitle: { ...typography.body },
});
