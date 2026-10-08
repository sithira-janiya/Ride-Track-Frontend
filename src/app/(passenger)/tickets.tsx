import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { TicketCard } from '@/features/tickets/components/TicketCard';
import { usePendingPaymentCheck, useTicketList } from '@/features/tickets/hooks/use-tickets';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useTicketCache } from '@/store/tickets';
import { spacing, typography } from '@/theme';
import type { Ticket, TicketStatus } from '@/types';

const FILTERS: { value: TicketStatus | undefined; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'USED', label: 'Used' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: undefined, label: 'All' },
];

export default function TicketsScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus | undefined>('ACTIVE');
  const list = useTicketList(status);
  const { pendingIds, recheck } = usePendingPaymentCheck();
  const cache = useTicketCache((s) => s.byId);

  const open = (id: number) => router.push({ pathname: '/ticket/[id]', params: { id: String(id) } });

  // offline or failed: fall back to whatever is cached on this device (NFR10)
  const cached: Ticket[] = Object.values(cache)
    .filter((t) => !status || t.status === status)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const fetched = list.data?.pages.flatMap((p) => p.items) ?? [];
  const tickets = list.isError ? cached : fetched;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            {t('My tickets')}
          </Text>

          {pendingIds.length > 0 ? (
            <Card style={{ borderColor: c.warning, backgroundColor: c.warningBg }}>
              <Text style={[styles.body, { color: c.text }]}>
                {t(
                  pendingIds.length === 1
                    ? '1 payment is waiting to be confirmed. Your ticket will appear here once the payment goes through.'
                    : '{count} payments are waiting to be confirmed. Your tickets will appear here once the payments go through.',
                  { count: pendingIds.length },
                )}
              </Text>
              <Button title="Check payment status" variant="secondary" onPress={recheck} />
            </Card>
          ) : null}

          <Chips label="Ticket status" options={FILTERS} value={status} onChange={setStatus} />

          {list.isPending ? (
            <Loading label="Loading tickets…" />
          ) : (
            <>
              {list.isError ? (
                <ErrorMessage message={`${t(errorMessage(list.error))} ${t('Showing tickets saved on this device.')}`} onRetry={() => list.refetch()} />
              ) : null}
              {tickets.length === 0 ? (
                <EmptyState title="No tickets here" message="Buy a ticket from any route and it will show up here." />
              ) : (
                <View style={styles.list}>
                  {tickets.map((t) => (
                    <TicketCard key={t.ticketId} ticket={t} onPress={() => open(t.ticketId)} />
                  ))}
                  {!list.isError && list.hasNextPage ? (
                    <Button
                      title="Load more"
                      variant="secondary"
                      loading={list.isFetchingNextPage}
                      onPress={() => list.fetchNextPage()}
                    />
                  ) : null}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  body: { ...typography.body },
  list: { gap: spacing.sm },
});
