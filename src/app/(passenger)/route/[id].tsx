import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { routesApi } from '@/api/endpoints';
import { ArrivalRow } from '@/components/routes/ArrivalRow';
import { StopRow } from '@/components/routes/StopRow';
import { Button, Emoji, EmptyState, ErrorMessage, FadeInView, Loading, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useFavourites } from '@/store/favourites';
import { spacing, typography } from '@/theme';
import { modeEmoji, modeLabel } from '@/utils/format';

export default function RouteDetailScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; stopId?: string }>();
  const routeId = Number(params.id);
  const [pickedStopId, setPickedStopId] = useState<number | null>(params.stopId ? Number(params.stopId) : null);

  const route = useQuery({ queryKey: ['route', routeId], queryFn: () => routesApi.detail(routeId), enabled: Number.isFinite(routeId) });

  // fall back to the first stop until the passenger picks one
  const selectedStopId = pickedStopId ?? route.data?.stops[0]?.stopId ?? null;

  const arrivals = useQuery({
    queryKey: ['arrivals', routeId, selectedStopId],
    queryFn: () => routesApi.arrivals(routeId, selectedStopId!),
    enabled: selectedStopId != null,
    refetchInterval: 30_000, // keep ETAs fresh while the screen is open
  });

  const isFavourite = useFavourites((s) => s.routeIds.includes(routeId));
  const toggleFavourite = useFavourites((s) => s.toggle);
  const selectedStop = route.data?.stops.find((s) => s.stopId === selectedStopId);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Button title="← Back" variant="secondary" style={{ alignSelf: 'flex-start' }} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />

          {route.isPending ? (
            <Loading label="Loading route…" emoji="🗺️" />
          ) : route.isError ? (
            <ErrorMessage message={errorMessage(route.error)} onRetry={() => route.refetch()} />
          ) : (
            <>
              <FadeInView style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.titleLeft}>
                    <Emoji symbol={modeEmoji(route.data.mode)} size={32} motion="float" />
                    <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
                      {route.data.routeNo}
                    </Text>
                  </View>
                  <StatusBadge label={modeLabel(route.data.mode)} tone="info" />
                </View>
                <Text style={[styles.sub, { color: c.textSecondary }]}>{route.data.name}</Text>
                <Button title="Buy a ticket" emoji="💳" onPress={() => router.push({ pathname: '/buy/[routeId]', params: { routeId: String(routeId) } })} />
                <Button title="Track live on map" emoji="🗺️" variant="secondary" onPress={() => router.push({ pathname: '/map/[id]', params: { id: String(routeId) } })} />
                <Button
                  title={isFavourite ? 'Saved to favourites' : 'Save to favourites'}
                  emoji={isFavourite ? '⭐' : '☆'}
                  variant={isFavourite ? 'primary' : 'secondary'}
                  onPress={() => toggleFavourite(routeId)}
                />
              </FadeInView>

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                🚏 {t('Stops and fares')}
              </Text>
              <Text style={[styles.sub, { color: c.textSecondary }]}>{t('Tap a stop to see upcoming arrivals there.')}</Text>
              <View style={styles.list}>
                {route.data.stops.map((s, i) => (
                  <StopRow key={s.stopId} index={i} stop={s} selected={s.stopId === selectedStopId} onPress={() => setPickedStopId(s.stopId)} />
                ))}
              </View>

              <Text accessibilityRole="header" style={[styles.section, { color: c.text }]}>
                ⏱️ {t('Upcoming at {stop}', { stop: selectedStop?.name ?? '…' })}
              </Text>
              {arrivals.isPending ? (
                <Loading label="Loading arrivals…" emoji="⏱️" />
              ) : arrivals.isError ? (
                <ErrorMessage message={errorMessage(arrivals.error)} onRetry={() => arrivals.refetch()} />
              ) : arrivals.data.length === 0 ? (
                <EmptyState emoji="🌙" title="No upcoming arrivals" message="There are no more trips at this stop today." />
              ) : (
                <View style={styles.list}>
                  {[...arrivals.data]
                    .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())
                    .map((a, i) => (
                      <FadeInView key={`${selectedStopId}-${a.tripId}`} index={i}>
                        <ArrivalRow arrival={a} />
                      </FadeInView>
                    ))}
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
  header: { gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heading: { ...typography.heading },
  sub: { ...typography.body },
  section: { ...typography.title, marginTop: spacing.sm },
  list: { gap: spacing.sm },
});
