import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { Card, Chips, EmptyState, ErrorMessage, Loading, StatusBadge, type Tone } from '@/components/ui';
import { AdminPage } from '@/features/admin/components/AdminPage';
import { useAdminRoutes, useAdminTrips } from '@/features/admin/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { TripStatus } from '@/types';
import { countOf, formatClock } from '@/utils/format';

const STATUS: Record<TripStatus, { label: string; tone: Tone }> = {
  SCHEDULED: { label: 'Scheduled', tone: 'info' },
  ONGOING: { label: 'Running', tone: 'success' },
  DELAYED: { label: 'Delayed', tone: 'warning' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  COMPLETED: { label: 'Completed', tone: 'info' },
};

// The server groups trips by UTC day, so the day chips are UTC days too.
const utcDay = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
const DAYS = [
  { value: -1, label: 'Yesterday' },
  { value: 0, label: 'Today' },
  { value: 1, label: 'Tomorrow' },
];

export default function TripsScreen() {
  const c = useColors();
  const [dayOffset, setDayOffset] = useState(0);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const routes = useAdminRoutes();
  const trips = useAdminTrips(utcDay(dayOffset), routeId);

  const routeOptions = [
    { value: undefined as number | undefined, label: 'All routes' },
    ...(routes.data ?? []).map((r) => ({ value: r.routeId as number | undefined, label: r.routeNo })),
  ];

  return (
    <AdminPage>
      <Chips label="Day" options={DAYS} value={dayOffset} onChange={setDayOffset} />
      <Chips label="Route" options={routeOptions} value={routeId} onChange={setRouteId} translateOptions={false} />

      {trips.isPending ? (
        <Loading label="Loading trips…" />
      ) : trips.isError ? (
        <ErrorMessage message={errorMessage(trips.error)} onRetry={() => trips.refetch()} />
      ) : trips.data.length === 0 ? (
        <EmptyState title="No trips" message="Nothing is timetabled for this day and route." />
      ) : (
        <>
          <Text accessibilityLiveRegion="polite" style={[styles.caption, { color: c.textSecondary }]}>
            {countOf(trips.data.length, 'trip')} on {utcDay(dayOffset)}
          </Text>
          {trips.data.map((t) => (
            <Card key={t.tripId}>
              <View style={styles.row}>
                <Text style={[styles.name, { color: c.text }]}>
                  {formatClock(t.startTime)}
                  {t.endTime ? ` – ${formatClock(t.endTime)}` : ''} · Route {t.routeNo}
                </Text>
                <StatusBadge label={STATUS[t.status].label} tone={STATUS[t.status].tone} />
              </View>
              <Text style={[styles.caption, { color: c.textSecondary }]}>
                Trip {t.tripId} · {t.regNo} · {countOf(t.tickets, 'ticket')} sold
              </Text>
            </Card>
          ))}
        </>
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  name: { ...typography.body, fontWeight: '700', flexShrink: 1 },
  caption: { ...typography.caption },
});
