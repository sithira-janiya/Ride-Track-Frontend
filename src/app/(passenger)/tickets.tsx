import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { usePendingPaymentCheck, useTicketList } from '@/hooks/use-tickets';
import { useTicketCache } from '@/store/tickets';
import { minTouchTarget, radius, spacing, typography } from '@/theme';
import type { Ticket } from '@/types';

const FILTERS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'USED', label: 'Used' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: undefined, label: 'All' },
] as const;

export default function TicketsScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const [status, setStatus] = useState<string | undefined>('ACTIVE');
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

          <View accessibilityRole="radiogroup" style={styles.filters}>
            {FILTERS.map((f) => {
              const selected = f.value === status;
              return (
                <Pressable
                  key={f.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t(f.label)}
                  onPress={() => setStatus(f.value)}
                  style={[styles.chip, { backgroundColor: selected ? c.primary : c.background, borderColor: selected ? c.primary : c.border }]}>
                  <Text style={[styles.chipText, { color: selected ? c.onPrimary : c.text }]}>{t(f.label)}</Text>
                </Pressable>
              );
            })}
          </View>

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
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: minTouchTarget, justifyContent: 'center', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md },
  chipText: { ...typography.body, fontWeight: '600' },
  list: { gap: spacing.sm },
});
