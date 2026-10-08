import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { Ticket } from '@/types';
import { formatFare } from '@/utils/format';

import { TICKET_STATUS, ticketJourney, ticketTitle } from '../ticket-display';

export function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const c = useColors();
  const t = useT();
  const status = TICKET_STATUS[ticket.status];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ticketTitle(ticket, t)}, ${ticketJourney(ticket, t)}, ${formatFare(ticket.fare)}, ${t(status.label)}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: c.text }]}>{ticketTitle(ticket, t)}</Text>
        <StatusBadge label={status.label} tone={status.tone} />
      </View>
      <Text style={[styles.body, { color: c.text }]}>{ticketJourney(ticket, t)}</Text>
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
