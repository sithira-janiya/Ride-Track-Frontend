import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { opsApi, routesApi } from '@/api/endpoints';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';
import type { Report, ReportType } from '@/types';

const TYPES: { value: ReportType; label: string }[] = [
  { value: 'ROUTE_PERFORMANCE', label: 'Route performance' },
  { value: 'DELAYS', label: 'Delays' },
  { value: 'OCCUPANCY', label: 'Occupancy' },
];
const RANGES = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
];

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

type Criteria = { type: ReportType; routeId: number | undefined; days: number };

/** A horizontal bar per row, scaled to the largest value, with the number printed beside it. */
function BarChart({ report }: { report: Report }) {
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

function ReportTable({ report }: { report: Report }) {
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

export default function ReportsScreen() {
  const c = useColors();
  const [draft, setDraft] = useState<Criteria>({ type: 'ROUTE_PERFORMANCE', routeId: undefined, days: 7 });
  // only the criteria the officer generated with; editing the filters does not change the shown report
  const [submitted, setSubmitted] = useState<Criteria | null>(null);

  const routes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const report = useQuery({
    queryKey: ['report', submitted],
    queryFn: () => {
      const to = new Date();
      const from = new Date(to.getTime() - (submitted!.days - 1) * 86400000);
      return opsApi.report(submitted!.type, submitted!.routeId, isoDay(from), isoDay(to));
    },
    enabled: submitted != null,
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Reports
          </Text>

          <Text style={[styles.label, { color: c.text }]}>Report</Text>
          <Chips label="Report type" options={TYPES} value={draft.type} onChange={(type) => setDraft({ ...draft, type })} />

          <Text style={[styles.label, { color: c.text }]}>Route</Text>
          <Chips
            label="Route"
            value={draft.routeId}
            onChange={(routeId) => setDraft({ ...draft, routeId })}
            options={[{ value: undefined, label: 'All routes' }, ...(routes.data ?? []).map((r) => ({ value: r.routeId as number | undefined, label: r.routeNo }))]}
          />

          <Text style={[styles.label, { color: c.text }]}>Period</Text>
          <Chips label="Period" options={RANGES} value={draft.days} onChange={(days) => setDraft({ ...draft, days })} />

          <Button title="Generate report" loading={report.isFetching} onPress={() => setSubmitted(draft)} />

          {report.isError ? <ErrorMessage message={errorMessage(report.error)} onRetry={() => report.refetch()} /> : null}
          {report.isFetching && !report.data ? <Loading label="Generating report…" /> : null}
          {report.data ? (
            report.data.rows.length === 0 ? (
              <EmptyState title="No data" message="There is nothing to report for these filters." />
            ) : (
              <Card>
                <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
                  {report.data.title}
                </Text>
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {report.data.from} to {report.data.to}
                </Text>
                <Text style={[styles.label, { color: c.text }]}>{report.data.columns[report.data.chartColumn]}</Text>
                <BarChart report={report.data} />
                <ReportTable report={report.data} />
              </Card>
            )
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  title: { ...typography.title },
  label: { ...typography.body, fontWeight: '700' },
  caption: { ...typography.caption },
  chart: { gap: spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: { ...typography.caption, width: 110 },
  barTrack: { flex: 1, height: 14, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  barValue: { ...typography.caption, width: 48, textAlign: 'right', fontWeight: '700' },
  table: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  th: { ...typography.caption, flex: 1, fontWeight: '700', padding: spacing.sm },
  td: { ...typography.caption, flex: 1, padding: spacing.sm },
  first: { flex: 2 },
});
