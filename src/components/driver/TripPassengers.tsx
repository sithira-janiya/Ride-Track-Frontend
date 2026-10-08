import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { StatTile } from '@/components/ops/StatTile';
import { ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useTripPassengers } from '@/hooks/use-driver';
import { spacing, typography } from '@/theme';
import { formatFare } from '@/utils/format';

/** Tickets on one trip, as the driver needs them: paid, boarded, revenue and each ticket's stops. Never who the passengers are. */
export function TripPassengers({ tripId }: { tripId: number }) {
  const c = useColors();
  const passengers = useTripPassengers(tripId);

  if (passengers.isPending) return <Loading label="Loading passengers…" />;
  if (passengers.isError) return <ErrorMessage message={errorMessage(passengers.error)} onRetry={() => passengers.refetch()} />;
  const p = passengers.data;

  return (
    <View style={styles.wrap}>
      <View style={styles.tiles}>
        <StatTile label="Tickets paid" value={String(p.paid)} />
        <StatTile label="Boarded" value={String(p.boarded)} hint="Tickets scanned on the bus" />
        <StatTile label="Revenue" value={formatFare(p.revenue)} />
      </View>
      {p.tickets.length === 0 ? (
        <Text style={[styles.body, { color: c.textSecondary }]}>No tickets sold for this trip yet.</Text>
      ) : (
        p.tickets.map((tk) => (
          <View key={tk.ticketId} style={[styles.ticket, { borderColor: c.border }]}>
            <Text style={[styles.body, { color: c.text, flex: 1 }]}>
              #{tk.ticketId} · {tk.boardStopName} → {tk.alightStopName}
            </Text>
            <StatusBadge label={tk.status === 'USED' ? 'Boarded' : 'Not boarded yet'} tone={tk.status === 'USED' ? 'success' : 'info'} />
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  body: { ...typography.body },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
});
