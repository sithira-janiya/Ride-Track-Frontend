import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { BackButton, Button, Card, ErrorMessage, Loading, StatusBadge } from '@/components/ui';
import { useBrightnessBoost } from '@/features/tickets/hooks/use-brightness-boost';
import { useCancelTicket, useTicket } from '@/features/tickets/hooks/use-tickets';
import { TICKET_STATUS, ticketJourney, ticketTitle } from '@/features/tickets/ticket-display';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { confirmAction } from '@/lib/confirm';
import { spacing, typography } from '@/theme';
import { formatFare } from '@/utils/format';

export default function TicketScreen() {
  const c = useColors();
  const tr = useT();
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const ticket = useTicket(id);
  const cancel = useCancelTicket(id);

  const t = ticket.data;
  useBrightnessBoost(t?.status === 'ACTIVE' && !!t.qrToken);

  const confirmCancel = async () => {
    const ok = await confirmAction(tr('Cancel this ticket?'), tr('Refund rules apply. This cannot be undone.'), tr('Cancel ticket'), tr('Keep ticket'));
    if (ok) cancel.mutate();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <BackButton fallback="/tickets" />

          {!t && ticket.isPending ? (
            <Loading label="Loading ticket…" />
          ) : !t ? (
            <ErrorMessage message={errorMessage(ticket.error)} onRetry={() => ticket.refetch()} />
          ) : (
            <>
              <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
                {ticketTitle(t, tr)}
              </Text>
              <StatusBadge label={TICKET_STATUS[t.status].label} tone={TICKET_STATUS[t.status].tone} />
              {ticket.isError ? (
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {tr('You are offline. Showing the copy saved on this device.')}
                </Text>
              ) : null}

              {t.status === 'ACTIVE' && t.qrToken ? (
                <View style={styles.qrWrap}>
                  {/* scanners need dark-on-white regardless of theme */}
                  <View accessible accessibilityLabel={tr('Ticket QR code. Show this to the conductor.')} style={styles.qrBox}>
                    <QRCode value={t.qrToken} size={240} />
                  </View>
                  <Text style={[styles.caption, { color: c.textSecondary }]}>
                    {tr('Ticket number {id}. Show this code to the conductor.', { id: t.ticketId })}
                  </Text>
                </View>
              ) : t.status === 'PENDING' ? (
                <Card style={{ borderColor: c.warning, backgroundColor: c.warningBg }}>
                  <Text style={[styles.body, { color: c.text }]}>
                    {tr('We are waiting for your payment to be confirmed. Your QR code will appear here as soon as it is.')}
                  </Text>
                  <Button title="Check again" variant="secondary" loading={ticket.isFetching} onPress={() => ticket.refetch()} />
                </Card>
              ) : (
                <Text style={[styles.body, { color: c.textSecondary }]}>{tr('This ticket can no longer be scanned.')}</Text>
              )}

              <Card>
                <Text style={[styles.body, { color: c.text }]}>{ticketJourney(t, tr)}</Text>
                <Text style={[styles.body, { color: c.text }]}>{tr('Fare: {amount}', { amount: formatFare(t.fare) })}</Text>
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {tr('Bought {date}', { date: new Date(t.issuedAt).toLocaleString() })}
                </Text>
              </Card>

              {t.status === 'ACTIVE' ? (
                <>
                  {cancel.isError ? <ErrorMessage message={errorMessage(cancel.error)} /> : null}
                  <Button title="Cancel ticket" variant="danger" loading={cancel.isPending} onPress={confirmCancel} />
                </>
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
  body: { ...typography.body },
  caption: { ...typography.caption },
  qrWrap: { alignItems: 'center', gap: spacing.sm },
  qrBox: { backgroundColor: '#FFFFFF', padding: spacing.md, borderRadius: spacing.md },
});
