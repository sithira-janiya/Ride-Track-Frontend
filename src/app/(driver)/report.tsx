import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { TripCard } from '@/components/routes/TripCard';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useDriverAlert, useDriverMe } from '@/hooks/use-driver';
import { spacing, typography } from '@/theme';
import type { AlertType } from '@/types';

const TYPES: { value: AlertType; label: string }[] = [
  { value: 'DELAY', label: 'Delay' },
  { value: 'ROUTE_CHANGE', label: 'Detour' },
  { value: 'CANCELLATION', label: 'Cancellation' },
];

/** Tell the passengers on the current trip about a delay, detour or cancellation (RideTrack-API `POST /driver/alerts`). */
export default function DriverReportScreen() {
  const c = useColors();
  const me = useDriverMe();
  const send = useDriverAlert();
  const [type, setType] = useState<AlertType>('DELAY');
  const [message, setMessage] = useState('');
  const [minutes, setMinutes] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  const trip = me.data?.trip;
  const finished = trip?.status === 'CANCELLED' || trip?.status === 'COMPLETED';

  const submit = () => {
    if (message.trim().length < 5) return setFormError('Write a short message for passengers (at least 5 characters).');
    if (type === 'DELAY' && minutes && (!/^\d+$/.test(minutes) || Number(minutes) < 1 || Number(minutes) > 600)) {
      return setFormError('Delay minutes must be a whole number from 1 to 600.');
    }
    setFormError(undefined);
    send.mutate(
      { tripId: trip?.tripId, type, message: message.trim(), delayMinutes: type === 'DELAY' && minutes ? Number(minutes) : undefined },
      {
        onSuccess: () => {
          setMessage('');
          setMinutes('');
        },
      },
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Report a problem
          </Text>

          {me.isPending ? (
            <Loading label="Loading your trip…" />
          ) : me.isError ? (
            <ErrorMessage message={errorMessage(me.error)} onRetry={() => me.refetch()} />
          ) : !trip || finished ? (
            <EmptyState title="No trip to report on" message="Alerts go to the passengers of the trip your bus is running or about to run." />
          ) : (
            <>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Passengers holding a ticket for this trip are notified straight away.
              </Text>
              <TripCard trip={trip} title="Alert for this trip" />

              <Card>
                <Text style={[styles.label, { color: c.text }]}>What happened?</Text>
                <Chips label="Alert type" options={TYPES} value={type} onChange={setType} />
                <TextField
                  label="Message to passengers"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={3}
                  maxLength={255}
                  placeholder="e.g. Heavy traffic at Borella."
                />
                {type === 'DELAY' ? (
                  <TextField label="Delay in minutes (optional)" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={3} />
                ) : null}

                {formError ? <ErrorMessage message={formError} /> : null}
                {send.isError ? <ErrorMessage message={errorMessage(send.error)} /> : null}
                {send.isSuccess && !message ? (
                  <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
                    ✓ Alert sent. Passengers on this trip are being notified.
                  </Text>
                ) : null}
                <Button title="Send alert" loading={send.isPending} onPress={submit} />
              </Card>
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
  label: { ...typography.body, fontWeight: '700' },
  body: { ...typography.body },
});
