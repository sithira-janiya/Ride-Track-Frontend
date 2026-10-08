import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';
import type { Report } from '@/types';

/** Every row of a report with all its value columns. */
export function ReportTable({ report }: { report: Report }) {
  const c = useColors();
  return (
    <View style={[styles.table, { borderColor: c.border }]}>
      <View style={[styles.tr, { backgroundColor: c.surface }]}>
        <Text style={[styles.th, styles.first, { color: c.text }]}>{report.type === 'DELAYS' ? 'Day' : 'Route'}</Text>
        {report.columns.map((col) => (
          <Text key={col} style={[styles.th, { color: c.text }]}>
            {col}
          </Text>
        ))}
      </View>
      {report.rows.map((r) => (
        <View key={r.label} style={[styles.tr, { borderTopColor: c.border, borderTopWidth: 1 }]}>
          <Text style={[styles.td, styles.first, { color: c.text }]}>{r.label}</Text>
          {r.values.map((v, i) => (
            <Text key={report.columns[i]} style={[styles.td, { color: c.text }]}>
              {v.toLocaleString()}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  th: { ...typography.caption, flex: 1, fontWeight: '700', padding: spacing.sm },
  td: { ...typography.caption, flex: 1, padding: spacing.sm },
  first: { flex: 2 },
});
