import { StyleSheet, Text, View } from 'react-native';

import { Card, ETAChip, StatusBadge, type Tone } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';
import type { Arrival, TripStatus } from '@/types';
import { formatClock } from '@/utils/format';

/** How a trip's status reads to people, with its badge tone. */
export const TRIP_STATUS: Record<TripStatus, { label: string; tone: Tone }> = {
  SCHEDULED: { label: 'On schedule', tone: 'info' },
  ONGOING: { label: 'On the way', tone: 'success' },
  DELAYED: { label: 'Delayed', tone: 'warning' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  COMPLETED: { label: 'Completed', tone: 'info' },
};

export function ArrivalRow({ arrival }: { arrival: Arrival }) {
  const c = useColors();
  const t = useT();
  const status = TRIP_STATUS[arrival.status];
  return (
    <Card>
      <View style={styles.row}>
        <ETAChip eta={arrival.eta} scheduled={arrival.scheduled} />
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {t(arrival.scheduled ? 'Arrives about {time} (timetable, no live position yet)' : 'Arrives about {time}', {
          time: formatClock(arrival.eta),
        })}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  meta: { ...typography.caption },
});
