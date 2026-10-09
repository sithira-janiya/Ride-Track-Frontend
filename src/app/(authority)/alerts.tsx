import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { alertsApi, routesApi } from '@/api/endpoints';
import { Button, Card, Chips, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, ScreenHeader, StatusBadge, TextField, type Tone } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useRouteTrips } from '@/hooks/use-ops';
import { spacing, typography } from '@/theme';
import type { AlertType } from '@/types';
import { formatClock } from '@/utils/format';

const TYPES: { value: AlertType; label: string; emoji: string }[] = [
  { value: 'DELAY', label: 'Delay', emoji: '⏰' },
  { value: 'CANCELLATION', label: 'Cancellation', emoji: '❌' },
  { value: 'ROUTE_CHANGE', label: 'Route change', emoji: '🔀' },
];
const BADGE: Record<AlertType, { label: string; tone: Tone; emoji: string }> = {
  DELAY: { label: 'Delay', tone: 'warning', emoji: '⏰' },
  CANCELLATION: { label: 'Cancelled', tone: 'danger', emoji: '❌' },
  ROUTE_CHANGE: { label: 'Route change', tone: 'info', emoji: '🔀' },
};

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

  const routes = useQuery({ queryKey: ['routes', '', 'ALL'], queryFn: () => routesApi.search() });
  const trips = useRouteTrips(routeId);
  const published = useQuery({ queryKey: ['alerts'], queryFn: () => alertsApi.list() });

  const publish = useMutation({
    mutationFn: () =>
      alertsApi.publish({ tripId: tripId!, type, message: message.trim(), delayMinutes: type === 'DELAY' && minutes ? Number(minutes) : undefined }),
    onSuccess: () => {
      setMessage('');
      setMinutes('');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['ops', 'dashboard'] });
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
          <ScreenHeader title="Alerts" emoji="📢" />

          <Card>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              ✍️ Publish an alert
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
                  <Loading label="Loading trips…" emoji="🕒" />
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
              <Animated.View entering={ZoomIn.springify()} style={styles.lead}>
                <Emoji symbol="📣" size={22} motion="wave" />
                <Text accessibilityLiveRegion="polite" style={[styles.body, styles.flex, { color: c.success }]}>
                  ✓ Alert published. Passengers are being notified.
                </Text>
              </Animated.View>
            ) : null}
            <Button title="Publish alert" emoji="📢" loading={publish.isPending} onPress={submit} />
          </Card>

          <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
            🗂️ Published alerts
          </Text>
          {published.isPending ? (
            <Loading label="Loading alerts…" emoji="📢" />
          ) : published.isError ? (
            <ErrorMessage message={errorMessage(published.error)} onRetry={() => published.refetch()} />
          ) : published.data.length === 0 ? (
            <EmptyState illustration="alerts" title="Nothing published yet" message="Alerts you publish will be listed here." />
          ) : (
            published.data.map((a, i) => (
              <FadeInView key={a.alertId} index={i}>
                <Card>
                  <View style={styles.row}>
                    <View style={styles.lead}>
                      <Emoji symbol={BADGE[a.type].emoji} size={20} />
                      <StatusBadge label={BADGE[a.type].label} tone={BADGE[a.type].tone} />
                    </View>
                    <Text style={[styles.caption, { color: c.textSecondary }]}>Trip {a.tripId} · {new Date(a.createdAt).toLocaleString()}</Text>
                  </View>
                  <Text style={[styles.body, { color: c.text }]}>{a.message}</Text>
                  {a.delayMinutes ? <Text style={[styles.caption, { color: c.textSecondary }]}>About {a.delayMinutes} minutes late</Text> : null}
                </Card>
              </FadeInView>
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
  title: { ...typography.title },
  label: { ...typography.body, fontWeight: '700' },
  body: { ...typography.body },
  caption: { ...typography.caption },
  lead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
});
