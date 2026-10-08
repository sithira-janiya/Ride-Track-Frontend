import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { BarChart } from '@/features/ops/components/BarChart';
import { ReportTable } from '@/features/ops/components/ReportTable';
import { useReport, type ReportCriteria } from '@/features/ops/hooks/use-ops';
import { useAllRoutes } from '@/features/routes/hooks/use-routes';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { ReportType } from '@/types';

const TYPES: { value: ReportType; label: string }[] = [
  { value: 'ROUTE_PERFORMANCE', label: 'Route performance' },
  { value: 'DELAYS', label: 'Delays' },
  { value: 'OCCUPANCY', label: 'Occupancy' },
];
const RANGES = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
];

export default function ReportsScreen() {
  const c = useColors();
  const [draft, setDraft] = useState<ReportCriteria>({ type: 'ROUTE_PERFORMANCE', routeId: undefined, days: 7 });
  // only the criteria the officer generated with; editing the filters does not change the shown report
  const [submitted, setSubmitted] = useState<ReportCriteria | null>(null);

  const routes = useAllRoutes();
  const report = useReport(submitted);

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
});
