import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Brightness from 'expo-brightness';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { ticketsApi } from '@/api/endpoints';
import { TICKET_STATUS, ticketJourney, ticketTitle } from '@/components/tickets/TicketCard';
import { Button, Card, Emoji, ErrorMessage, FadeInView, Loading, ScreenHeader, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useTicket } from '@/hooks/use-tickets';
import { useTicketCache } from '@/store/tickets';
import { spacing, typography } from '@/theme';
import { formatFare } from '@/utils/format';

/** Max screen brightness while the QR is on screen so a scanner can read it, restored on leave. */
function useBrightnessBoost(active: boolean) {
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;
    let previous: number | null = null;
    (async () => {
      try {
        previous = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      } catch {
        // brightness is a nicety; the QR still works without it
      }
    })();
    return () => {
      if (previous != null) Brightness.setBrightnessAsync(previous).catch(() => {});
    };
  }, [active]);
}

export default function TicketScreen() {
  const c = useColors();
  const tr = useT();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const ticket = useTicket(id);
  const upsert = useTicketCache((s) => s.upsert);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const t = ticket.data;
  useBrightnessBoost(t?.status === 'ACTIVE' && !!t.qrToken);

  const cancel = useMutation({
    mutationFn: () => ticketsApi.cancel(id),
    onSuccess: (updated) => {
      upsert([updated]);
      queryClient.setQueryData(['ticket', id], updated);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setCancelError(null);
    },
    onError: (e) => setCancelError(errorMessage(e)),
  });

  const confirmCancel = () => {
    const run = () => cancel.mutate();
    if (Platform.OS === 'web') {
      if (window.confirm(tr('Cancel this ticket? Refund rules apply.'))) run();
      return;
    }
    Alert.alert(tr('Cancel this ticket?'), tr('Refund rules apply. This cannot be undone.'), [
      { text: tr('Keep ticket'), style: 'cancel' },
      { text: tr('Cancel ticket'), style: 'destructive', onPress: run },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Button title="← Back" variant="secondary" style={{ alignSelf: 'flex-start' }} onPress={() => (router.canGoBack() ? router.back() : router.replace('/tickets'))} />

          {!t && ticket.isPending ? (
            <Loading label="Loading ticket…" emoji="🎟️" />
          ) : !t ? (
            <ErrorMessage message={errorMessage(ticket.error)} onRetry={() => ticket.refetch()} />
          ) : (
            <>
              <ScreenHeader title={ticketTitle(t, tr)} emoji="🎟️" />
              <StatusBadge label={TICKET_STATUS[t.status].label} tone={TICKET_STATUS[t.status].tone} />
              {ticket.isError ? (
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {tr('You are offline. Showing the copy saved on this device.')}
                </Text>
              ) : null}

              {t.status === 'ACTIVE' && t.qrToken ? (
                <Animated.View entering={ZoomIn.springify().damping(14).delay(120)} style={styles.qrWrap}>
                  {/* scanners need dark-on-white regardless of theme */}
                  <View accessible accessibilityLabel={tr('Ticket QR code. Show this to the conductor.')} style={styles.qrBox}>
                    <QRCode value={t.qrToken} size={240} />
                  </View>
                  <Text style={[styles.caption, { color: c.textSecondary }]}>
                    👀 {tr('Ticket number {id}. Show this code to the conductor.', { id: t.ticketId })}
                  </Text>
                </Animated.View>
              ) : t.status === 'PENDING' ? (
                <Card style={{ borderColor: c.warning, backgroundColor: c.warningBg }}>
                  <Emoji symbol="⏳" size={28} motion="pulse" />
                  <Text style={[styles.body, { color: c.text }]}>
                    {tr('We are waiting for your payment to be confirmed. Your QR code will appear here as soon as it is.')}
                  </Text>
                  <Button title="Check again" emoji="🔄" variant="secondary" loading={ticket.isFetching} onPress={() => ticket.refetch()} />
                </Card>
              ) : (
                <Text style={[styles.body, { color: c.textSecondary }]}>🗃️ {tr('This ticket can no longer be scanned.')}</Text>
              )}

              <FadeInView delay={150}>
                <Card>
                  <Text style={[styles.body, { color: c.text }]}>🧭 {ticketJourney(t, tr)}</Text>
                  <Text style={[styles.body, { color: c.text }]}>💰 {tr('Fare: {amount}', { amount: formatFare(t.fare) })}</Text>
                  <Text style={[styles.caption, { color: c.textSecondary }]}>
                    🗓️ {tr('Bought {date}', { date: new Date(t.issuedAt).toLocaleString() })}
                  </Text>
                </Card>
              </FadeInView>

              {t.status === 'ACTIVE' ? (
                <Animated.View entering={FadeInDown.delay(250)} style={styles.cancel}>
                  {cancelError ? <ErrorMessage message={cancelError} /> : null}
                  <Button title="Cancel ticket" emoji="🗑️" variant="danger" loading={cancel.isPending} onPress={confirmCancel} />
                </Animated.View>
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
  body: { ...typography.body },
  caption: { ...typography.caption },
  qrWrap: { alignItems: 'center', gap: spacing.sm },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cancel: { gap: spacing.md },
});
