import { useQueryClient } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { mockApi } from '@/api/mock';
import { Button, Card, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, ScreenHeader, StatusBadge, type Tone } from '@/components/ui';
import { env } from '@/config/env';
import { useAlerts, useMarkRead } from '@/hooks/use-alerts';
import { useColors } from '@/hooks/use-colors';
import { useT, type Translate } from '@/i18n';
import { useAlertBanner } from '@/store/alert-banner';
import { spacing, typography } from '@/theme';
import type { AlertType } from '@/types';

const TYPE: Record<AlertType, { label: string; tone: Tone; emoji: string }> = {
  DELAY: { label: 'Delay', tone: 'warning', emoji: '⏰' },
  CANCELLATION: { label: 'Cancelled', tone: 'danger', emoji: '❌' },
  ROUTE_CHANGE: { label: 'Route change', tone: 'info', emoji: '🔀' },
};

function when(iso: string, t: Translate) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return t('Just now');
  if (mins < 60) return t('{n} min ago', { n: mins });
  if (mins < 1440) return t('{n} h ago', { n: Math.round(mins / 60) });
  return new Date(iso).toLocaleDateString();
}

export default function AlertsScreen() {
  const c = useColors();
  const t = useT();
  const alerts = useAlerts();
  const markRead = useMarkRead();
  const queryClient = useQueryClient();
  const showBanner = useAlertBanner((s) => s.show);
  const unread = alerts.data?.filter((a) => !a.isRead) ?? [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ScreenHeader title={t('Alerts')} emoji="🔔" emojiMotion="wave" />

          {alerts.isPending ? (
            <Loading label="Loading alerts…" emoji="🔔" />
          ) : alerts.isError ? (
            <ErrorMessage message={errorMessage(alerts.error)} onRetry={() => alerts.refetch()} />
          ) : alerts.data.length === 0 ? (
            <EmptyState illustration="alerts" title="No alerts" message="Delays, cancellations and route changes will show up here." />
          ) : (
            <>
              {unread.length > 1 ? (
                <Button
                  title={t('Mark all {count} as read', { count: unread.length })}
                  emoji="✅"
                  variant="secondary"
                  onPress={() => unread.forEach((a) => markRead.mutate(a.alertId))}
                />
              ) : null}
              {alerts.data.map((a, i) => {
                const type = TYPE[a.type];
                return (
                  <FadeInView key={a.alertId} index={i}>
                    <Card style={!a.isRead ? { borderColor: c.primary, borderWidth: 2 } : undefined}>
                      <View style={styles.row}>
                        <View style={styles.type}>
                          <Emoji symbol={type.emoji} size={22} motion={!a.isRead ? 'pulse' : undefined} />
                          <StatusBadge label={type.label} tone={type.tone} />
                        </View>
                        <Text style={[styles.caption, { color: c.textSecondary }]}>
                          {!a.isRead ? `● ${t('New')} · ` : ''}
                          {when(a.createdAt, t)}
                        </Text>
                      </View>
                      <Text style={[styles.body, { color: c.text }]}>{t(a.message)}</Text>
                      {a.delayMinutes ? (
                        <Text style={[styles.caption, { color: c.textSecondary }]}>
                          {t('Delay: about {n} minutes', { n: a.delayMinutes })}
                        </Text>
                      ) : null}
                      {!a.isRead ? <Button title="Mark as read" emoji="👍" variant="secondary" onPress={() => markRead.mutate(a.alertId)} /> : null}
                    </Card>
                  </FadeInView>
                );
              })}
            </>
          )}

          {env.useMockApi ? (
            <Button
              title="Demo: simulate a new alert"
              emoji="🧪"
              variant="secondary"
              onPress={() => {
                const a = mockApi.createDemoAlert();
                showBanner(a.message);
                queryClient.invalidateQueries({ queryKey: ['alerts'] });
              }}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  type: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
