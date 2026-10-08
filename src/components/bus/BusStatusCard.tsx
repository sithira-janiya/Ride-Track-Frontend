import { StyleSheet, Text, View } from 'react-native';

import { Card, ETAChip, OccupancyBar, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { STALE_AFTER_MS, useNow } from '@/hooks/use-live-vehicles';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';
import type { Stop, VehiclePosition } from '@/types';
import { timeAgo } from '@/utils/format';
import { nearestStop } from '@/utils/geo';

type Props = {
  /** the bus's latest position, from the driver's phone or a GPS unit; null if it never reported */
  live: VehiclePosition | null;
  stops: Stop[];
  /** the driver is on duty, so their phone is sending the bus position */
  sharing: boolean;
};

/**
 * Where a bus is: live (with the stop it is near, the next-stop ETA and occupancy), waiting for a first fix, or not
 * sharing. A fresh position counts as live whoever sent it; duty only explains why there is none (or only an old one).
 */
export function BusStatusCard({ live, stops, sharing }: Props) {
  const c = useColors();
  const t = useT();
  const now = useNow();
  const near = live ? nearestStop(stops, live.lat, live.lng) : null;
  const age = live?.recordedAt ? now - Date.parse(live.recordedAt) : null;
  const fresh = age != null && age <= STALE_AFTER_MS;

  if (!sharing && !fresh) {
    return (
      <Card>
        <StatusBadge label="Not sharing its location" tone="warning" />
        <Text style={[styles.body, { color: c.text }]}>{t('The driver is not on duty, so this bus is not showing where it is right now.')}</Text>
        {near && age != null ? (
          <Text style={[styles.caption, { color: c.textSecondary }]}>
            {t('Last seen near {stop}, {ago}.', { stop: near.name, ago: timeAgo(age, t) })}
          </Text>
        ) : null}
      </Card>
    );
  }

  if (!live) {
    return (
      <Card>
        <StatusBadge label="Waiting for location" tone="info" />
        <Text style={[styles.body, { color: c.text }]}>
          {t('The driver is on duty. The bus appears here as soon as their phone sends its position.')}
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.row}>
        <StatusBadge label="Live" tone="success" />
        {age != null ? <Text style={[styles.caption, { color: c.textSecondary }]}>{t('Updated {ago}', { ago: timeAgo(age, t) })}</Text> : null}
      </View>
      {age != null && age > STALE_AFTER_MS ? (
        <Text accessibilityRole="alert" style={[styles.caption, { color: c.warning }]}>
          {t('The position may be out of date. The bus has not reported for over a minute.')}
        </Text>
      ) : null}
      {near ? <Text style={[styles.near, { color: c.text }]}>{t('Near {stop}', { stop: near.name })}</Text> : null}
      <View style={styles.row}>
        <Text style={[styles.body, { color: c.textSecondary }]}>{t('Next stop')}</Text>
        <ETAChip eta={live.eta} />
      </View>
      <OccupancyBar passengerCount={live.passengerCount} capacity={live.capacity} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  body: { ...typography.body },
  caption: { ...typography.caption },
  near: { ...typography.bodyLarge, fontWeight: '700' },
});
