import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi, ticketsApi } from '@/api/endpoints';
import { ArrivalRow } from '@/components/routes/ArrivalRow';
import { StopRow } from '@/components/routes/StopRow';
import { Button, Card, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useTicketCache } from '@/store/tickets';
import { spacing, typography } from '@/theme';
import { formatClock, formatFare } from '@/utils/format';
import { startPayment } from '@/utils/payment';

export default function BuyTicketScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const routeId = Number(useLocalSearchParams<{ routeId: string }>().routeId);

  const [boardId, setBoardId] = useState<number | null>(null);
  const [alightId, setAlightId] = useState<number | null>(null);
  const [tripId, setTripId] = useState<number | null>(null);

  const route = useQuery({ queryKey: ['route', routeId], queryFn: () => routesApi.detail(routeId), enabled: Number.isFinite(routeId) });
  const stops = route.data?.stops ?? [];
  const board = stops.find((s) => s.stopId === boardId);
  const alightOptions = board ? stops.filter((s) => s.stopSequence! > board.stopSequence!) : [];
  const alight = alightOptions.find((s) => s.stopId === alightId);
  const fare = board && alight ? alight.fareFromOrigin! - board.fareFromOrigin! : null;

  const arrivals = useQuery({
    queryKey: ['arrivals', routeId, boardId],
    queryFn: () => routesApi.arrivals(routeId, boardId!),
    enabled: boardId != null,
  });
  const trips = (arrivals.data ?? []).filter((a) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED');

  const pay = useMutation({
    mutationFn: async () => {
      const { addPending, clearPending, upsert } = useTicketCache.getState();
      const session = await ticketsApi.create({ tripId: tripId!, boardStopId: boardId!, alightStopId: alightId! });
      // remember it before the payment page opens, so closing the app mid-payment cannot lose it (NFR7)
      addPending(session.ticketId);
      await startPayment(session).catch(() => {});
      const ticket = await ticketsApi.get(session.ticketId).catch(() => null);
      if (ticket) {
        upsert([ticket]);
        if (ticket.status !== 'PENDING') clearPending(session.ticketId);
      }
      return session.ticketId;
    },
    onSuccess: (ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      router.replace({ pathname: '/ticket/[id]', params: { id: String(ticketId) } });
    },
  });

  const ready = boardId != null && alightId != null && tripId != null && fare != null && fare >= 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Button title="← Back" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            {t('Buy a ticket')}
            {route.data ? ` · ${route.data.routeNo}` : ''}
          </Text>

          {route.isPending ? (
            <Loading label="Loading route…" />
          ) : route.isError ? (
            <ErrorMessage message={errorMessage(route.error)} onRetry={() => route.refetch()} />
          ) : (
            <>
              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                {t('1. Where do you board?')}
              </Text>
              <View style={styles.list}>
                {stops.slice(0, -1).map((s) => (
                  <StopRow
                    key={s.stopId}
                    stop={s}
                    selected={s.stopId === boardId}
                    onPress={() => {
                      setBoardId(s.stopId);
                      setAlightId(null);
                      setTripId(null);
                    }}
                  />
                ))}
              </View>

              {board ? (
                <>
                  <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                    {t('2. Where do you get off?')}
                  </Text>
                  <View style={styles.list}>
                    {alightOptions.map((s) => (
                      <StopRow key={s.stopId} stop={s} selected={s.stopId === alightId} onPress={() => setAlightId(s.stopId)} />
                    ))}
                  </View>

                  <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                    {t('3. Which trip?')}
                  </Text>
                  {arrivals.isPending ? (
                    <Loading label="Loading trips…" />
                  ) : arrivals.isError ? (
                    <ErrorMessage message={errorMessage(arrivals.error)} onRetry={() => arrivals.refetch()} />
                  ) : trips.length === 0 ? (
                    <EmptyState title="No trips available" message="There are no more trips from this stop today." />
                  ) : (
                    <View style={styles.list}>
                      {[...trips]
                        .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())
                        .map((a) => (
                          <View key={a.tripId} style={a.tripId === tripId ? [styles.picked, { borderColor: c.primary }] : undefined}>
                            <ArrivalRow arrival={a} />
                            <Button
                              title={t(a.tripId === tripId ? 'Selected: {time}' : 'Choose {time} trip', { time: formatClock(a.eta) })}
                              variant={a.tripId === tripId ? 'primary' : 'secondary'}
                              onPress={() => setTripId(a.tripId)}
                              style={styles.pick}
                            />
                          </View>
                        ))}
                    </View>
                  )}
                </>
              ) : null}

              {ready ? (
                <Card>
                  <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                    {t('Fare summary')}
                  </Text>
                  <Text style={[styles.body, { color: c.text }]}>
                    {board!.name} → {alight!.name}
                  </Text>
                  <Text style={[styles.total, { color: c.text }]}>{formatFare(fare!)}</Text>
                  {pay.isError ? <ErrorMessage message={errorMessage(pay.error)} /> : null}
                  <Button title={t('Pay {amount}', { amount: formatFare(fare!) })} loading={pay.isPending} onPress={() => pay.mutate()} />
                  <Text style={[styles.caption, { color: c.textSecondary }]}>
                    {t('You will be taken to the secure payment page. Your ticket appears once payment is confirmed.')}
                  </Text>
                </Card>
              ) : null}
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
  section: { ...typography.title, marginTop: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.caption },
  total: { ...typography.heading },
  list: { gap: spacing.sm },
  picked: { borderWidth: 2, borderRadius: 16, padding: spacing.xs },
  pick: { marginTop: spacing.xs },
});
