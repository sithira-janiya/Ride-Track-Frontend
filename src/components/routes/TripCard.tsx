import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';
import type { Trip } from '@/types';
import { formatClock } from '@/utils/format';

import { TRIP_STATUS } from './ArrivalRow';

type Props = { trip: Trip; title?: string; highlighted?: boolean; children?: ReactNode };

/** One timetabled trip: when it runs and its status. `children` go below, e.g. the driver's start and end buttons. */
export function TripCard({ trip, title, highlighted, children }: Props) {
  const c = useColors();
  const t = useT();
  const status = TRIP_STATUS[trip.status];
  const times = trip.endTime
    ? t('{start} to {end}', { start: formatClock(trip.startTime), end: formatClock(trip.endTime) })
    : t('From {start}', { start: formatClock(trip.startTime) });
  return (
    <Card style={highlighted ? { borderColor: c.primary, borderWidth: 2 } : undefined}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: c.text }]}>{title ? t(title) : t('Trip {id}', { id: trip.tripId })}</Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={[styles.meta, { color: c.textSecondary }]}>{times}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  meta: { ...typography.body },
});
