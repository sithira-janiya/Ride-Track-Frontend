import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge, type Tone } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { Ticket, TicketStatus } from '@/types';
import { formatFare } from '@/utils/format';

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Payment pending', tone: 'warning' },
  ACTIVE: { label: 'Ready to use', tone: 'success' },
  USED: { label: 'Used', tone: 'info' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export function ticketTitle(t: Ticket) {
  return t.routeNo ? `Route ${t.routeNo}` : `Trip ${t.tripId}`;
}

export function ticketJourney(t: Ticket) {
  return `${t.boardStopName ?? `Stop ${t.boardStopId}`} → ${t.alightStopName ?? `Stop ${t.alightStopId}`}`;
}

export function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const c = useColors();
  const status = TICKET_STATUS[ticket.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ticketTitle(ticket)}, ${ticketJourney(ticket)}, ${formatFare(ticket.fare)}, ${status.label}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: c.text }]}>{ticketTitle(ticket)}</Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={[styles.body, { color: c.text }]}>{ticketJourney(ticket)}</Text>
      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {formatFare(ticket.fare)} · {new Date(ticket.issuedAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: minTouchTarget, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  meta: { ...typography.caption },
});
