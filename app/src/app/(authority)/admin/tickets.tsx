import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { errorMessage } from '@/api/client';
import { AdminPage } from '@/components/admin/AdminPage';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading, StatusBadge, type Tone } from '@/components/ui';
import { useAdminTickets } from '@/hooks/use-admin';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { PaymentStatus, TicketStatus } from '@/types';
import { formatFare } from '@/utils/format';

const FILTERS: { value: TicketStatus | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'USED', label: 'Used' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
];
const STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  PENDING: { label: 'Awaiting payment', tone: 'warning' },
  USED: { label: 'Used', tone: 'info' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
};
const PAYMENT: Record<PaymentStatus, string> = { PENDING: 'payment pending', PAID: 'paid', FAILED: 'payment failed', REFUNDED: 'refunded' };

/** Every ticket sold, newest first, with who bought it and how it was paid. */
export default function AdminTicketsScreen() {
  const c = useColors();
  const [status, setStatus] = useState<TicketStatus | undefined>(undefined);
  const list = useAdminTickets(status);
  const tickets = list.data?.pages.flatMap((p) => p.tickets) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;

  return (
    <AdminPage>
      <Chips label="Ticket status" options={FILTERS} value={status} onChange={setStatus} />

      {list.isPending ? (
        <Loading label="Loading tickets…" />
      ) : list.isError ? (
        <ErrorMessage message={errorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets" message="No tickets match this filter." />
      ) : (
        <>
          <Text accessibilityLiveRegion="polite" style={[styles.caption, { color: c.textSecondary }]}>
            Showing {tickets.length} of {total}
          </Text>
          {tickets.map((t) => (
            <Card key={t.ticketId}>
              <View style={styles.row}>
                <Text style={[styles.name, { color: c.text }]}>
                  #{t.ticketId} · Route {t.routeNo} · {formatFare(t.fare)}
                </Text>
                <StatusBadge label={STATUS[t.status].label} tone={STATUS[t.status].tone} />
              </View>
              <Text style={[styles.body, { color: c.textSecondary }]}>{t.passenger}</Text>
              <Text style={[styles.caption, { color: c.textSecondary }]}>
                {new Date(t.issuedAt).toLocaleString()} · Trip {t.tripId}
                {t.paymentStatus ? ` · ${PAYMENT[t.paymentStatus]}` : ''}
                {t.paymentMethod ? ` (${t.paymentMethod.toLowerCase()})` : ''}
              </Text>
            </Card>
          ))}
          {list.hasNextPage ? <Button title="Load more" variant="secondary" loading={list.isFetchingNextPage} onPress={() => list.fetchNextPage()} /> : null}
        </>
      )}
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  name: { ...typography.body, fontWeight: '700', flexShrink: 1 },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
