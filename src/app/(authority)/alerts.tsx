import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { alertsApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { Button, Card, Chips, EmptyState, ErrorMessage, Loading, StatusBadge, TextField } from '@/components/ui';
import { ALERT_TYPE } from '@/features/alerts/alert-types';
import { useAlerts } from '@/features/alerts/hooks/use-alerts';
import { useAllRoutes, useRouteTrips } from '@/features/routes/hooks/use-routes';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { AlertType } from '@/types';
import { formatClock } from '@/utils/format';

const TYPES: { value: AlertType; label: string }[] = [
  { value: 'DELAY', label: 'Delay' },
  { value: 'CANCELLATION', label: 'Cancellation' },
  { value: 'ROUTE_CHANGE', label: 'Route change' },
];

/** Publish a delay, cancellation or route-change alert and review what has been published (FR8, FR9). */
export default function AuthorityAlertsScreen() {
  const c = useColors();
  const queryClient = useQueryClient();
  const [routeId, setRouteId] = useState<number | null>(null);
  const [tripId, setTripId] = useState<number | null>(null);
  const [type, setType] = useState<AlertType>('DELAY');
  const [message, setMessage] = useState('');
  const [minutes, setMinutes] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  const routes = useAllRoutes();
  const trips = useRouteTrips(routeId);
  const published = useAlerts();

  const publish = useMutation({
    mutationFn: () =>
      alertsApi.publish({ tripId: tripId!, type, message: message.trim(), delayMinutes: type === 'DELAY' && minutes ? Number(minutes) : undefined }),
    onSuccess: () => {
      setMessage('');
      setMinutes('');
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
      queryClient.invalidateQueries({ queryKey: queryKeys.opsDashboard });
    },
  });

  const submit = () => {
    if (tripId == null) return setFormError('Choose the route and trip this alert is about.');
    if (message.trim().length < 5) return setFormError('Write a short message for passengers (at least 5 characters).');
    if (type === 'DELAY' && minutes && (!/^\d+$/.test(minutes) || Number(minutes) > 600)) return setFormError('Delay minutes must be a whole number up to 600.');
    setFormError(undefined);
    publish.mutate();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Alerts
          </Text>

          <Card>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              Publish an alert
            </Text>

            <Text style={[styles.label, { color: c.text }]}>Route</Text>
            <Chips
              label="Route"
              value={routeId ?? undefined}
              onChange={(v) => {
                setRouteId(v ?? null);
                setTripId(null);
              }}
              options={(routes.data ?? []).map((r) => ({ value: r.routeId as number | undefined, label: r.routeNo }))}
            />

            {routeId != null ? (
              <>
                <Text style={[styles.label, { color: c.text }]}>Trip</Text>
                {trips.isPending ? (
                  <Loading label="Loading trips…" />
                ) : trips.trips.length === 0 ? (
                  <Text style={[styles.body, { color: c.textSecondary }]}>No running trips on this route.</Text>
                ) : (
                  <Chips
                    label="Trip"
                    value={tripId ?? undefined}
                    onChange={(v) => setTripId(v ?? null)}
                    options={trips.trips.map((t) => ({ value: t.tripId as number | undefined, label: `Trip ${t.tripId} · ${formatClock(t.eta)}` }))}
                  />
                )}
              </>
            ) : null}

            <Text style={[styles.label, { color: c.text }]}>Type</Text>
            <Chips label="Alert type" options={TYPES} value={type} onChange={setType} />

            <TextField label="Message to passengers" value={message} onChangeText={setMessage} multiline numberOfLines={3} maxLength={200} />
            {type === 'DELAY' ? (
              <TextField label="Delay in minutes (optional)" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" maxLength={3} />
            ) : null}

            {formError ? <ErrorMessage message={formError} /> : null}
            {publish.isError ? <ErrorMessage message={errorMessage(publish.error)} /> : null}
            {publish.isSuccess && !message ? (
              <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
                ✓ Alert published. Passengers are being notified.
              </Text>
            ) : null}
            <Button title="Publish alert" loading={publish.isPending} onPress={submit} />
          </Card>

          <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
            Published alerts
          </Text>
          {published.isPending ? (
            <Loading label="Loading alerts…" />
          ) : published.isError ? (
            <ErrorMessage message={errorMessage(published.error)} onRetry={() => published.refetch()} />
          ) : published.data.length === 0 ? (
            <EmptyState title="Nothing published yet" message="Alerts you publish will be listed here." />
          ) : (
            published.data.map((a) => (
              <Card key={a.alertId}>
                <View style={styles.row}>
                  <StatusBadge label={ALERT_TYPE[a.type].label} tone={ALERT_TYPE[a.type].tone} />
                  <Text style={[styles.caption, { color: c.textSecondary }]}>Trip {a.tripId} · {new Date(a.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={[styles.body, { color: c.text }]}>{a.message}</Text>
                {a.delayMinutes ? <Text style={[styles.caption, { color: c.textSecondary }]}>About {a.delayMinutes} minutes late</Text> : null}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  title: { ...typography.title },
  label: { ...typography.body, fontWeight: '700' },
  body: { ...typography.body },
  caption: { ...typography.caption },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
});
