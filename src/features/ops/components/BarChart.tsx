import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';
import type { Report } from '@/types';

/** A horizontal bar per row, scaled to the largest value, with the number printed beside it. */
export function BarChart({ report }: { report: Report }) {
  const c = useColors();
  const values = report.rows.map((r) => r.values[report.chartColumn] ?? 0);
  const max = Math.max(1, ...values);
  return (
    <View accessibilityRole="image" accessibilityLabel={`Bar chart of ${report.columns[report.chartColumn]}`} style={styles.chart}>
      {report.rows.map((r, i) => (
        <View key={r.label} style={styles.barRow}>
          <Text numberOfLines={1} style={[styles.barLabel, { color: c.text }]}>
            {r.label}
          </Text>
          <View style={[styles.barTrack, { backgroundColor: c.border }]}>
            <View style={[styles.barFill, { width: `${(values[i] / max) * 100}%`, backgroundColor: c.primary }]} />
          </View>
          <Text style={[styles.barValue, { color: c.text }]}>
            {values[i]}
            {report.unit === '%' ? '%' : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: { ...typography.caption, width: 110 },
  barTrack: { flex: 1, height: 14, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  barValue: { ...typography.caption, width: 48, textAlign: 'right', fontWeight: '700' },
});
