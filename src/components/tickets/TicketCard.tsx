import { StyleSheet, Text, View } from 'react-native';

import { Emoji, PressableScale, StatusBadge, type Tone } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { fill, useT, type Translate } from '@/i18n';
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

export function ticketTitle(ticket: Ticket, t: Translate = fill) {
  return ticket.routeNo ? t('Route {no}', { no: ticket.routeNo }) : t('Trip {id}', { id: ticket.tripId });
}

export function ticketJourney(ticket: Ticket, t: Translate = fill) {
  const stop = (name: string | null | undefined, id: number) => name ?? t('Stop {n}', { n: id });
  return `${stop(ticket.boardStopName, ticket.boardStopId)} → ${stop(ticket.alightStopName, ticket.alightStopId)}`;
}

export function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const c = useColors();
  const t = useT();
  const status = TICKET_STATUS[ticket.status];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${ticketTitle(ticket, t)}, ${ticketJourney(ticket, t)}, ${formatFare(ticket.fare)}, ${t(status.label)}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          <Emoji symbol="🎫" size={22} />
          <Text style={[styles.title, { color: c.text }]}>{ticketTitle(ticket, t)}</Text>
        </View>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={[styles.body, { color: c.text }]}>{ticketJourney(ticket, t)}</Text>
      <Text style={[styles.meta, { color: c.textSecondary }]}>
        {formatFare(ticket.fare)} · {new Date(ticket.issuedAt).toLocaleDateString()}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: minTouchTarget, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  meta: { ...typography.caption },
});
