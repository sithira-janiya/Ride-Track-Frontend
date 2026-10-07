import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { radius, spacing, typography } from '@/theme';

type Props = {
  /** ISO timestamp of the estimated arrival */
  eta: string | null;
  /** true when taken from the timetable rather than live GPS (DFD 2.3.4) */
  scheduled?: boolean;
};

export function minutesUntil(iso: string, now = Date.now()) {
  return Math.max(0, Math.round((new Date(iso).getTime() - now) / 60000));
}

export function ETAChip({ eta, scheduled }: Props) {
  const c = useColors();
  const t = useT();
  const mins = eta ? minutesUntil(eta) : null;
  const text = mins == null ? '—' : mins === 0 ? t('Arriving now') : t('{mins} min', { mins });
  return (
    <View
      accessible
      accessibilityLabel={t(scheduled ? 'Arrives in {time}, scheduled time' : 'Arrives in {time}, live', { time: text })}
      style={[styles.chip, { backgroundColor: scheduled ? c.surface : c.infoBg, borderColor: scheduled ? c.border : c.info }]}>
      <Text style={[styles.time, { color: c.text }]}>{text}</Text>
      <Text style={[styles.kind, { color: c.textSecondary }]}>{t(scheduled ? 'Scheduled' : 'Live')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  time: { ...typography.body, fontWeight: '700' },
  kind: { ...typography.caption },
});
