import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import { formatDuration, formatFare, toClock, toMinutes } from '@/lib/format';
import type { TripResult } from '@/types/models';

/** One trip in the Results list: times, duration, fare and whether it is running on time. */
export function ResultCard({ result }: { result: TripResult }) {
  const { schedule, route } = result;
  const arrival = toClock(toMinutes(schedule.departure) + schedule.durationMinutes);
  const delayed = schedule.status === 'delayed';

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.body}>
        <View style={styles.top}>
          <Text variant="titleMedium" style={styles.bold}>
            {route.name}
          </Text>
          <Text variant="labelLarge" style={{ color: delayed ? colors.warning : colors.success }}>
            {delayed ? 'Delayed' : 'On time'}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.muted}>
          {route.from} to {route.to}
        </Text>
        <View style={styles.times}>
          <Text variant="headlineSmall" style={styles.bold}>
            {schedule.departure}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {formatDuration(schedule.durationMinutes)}
          </Text>
          <Text variant="headlineSmall" style={styles.bold}>
            {arrival}
          </Text>
        </View>
        <Text variant="titleMedium" style={styles.fare}>
          {formatFare(route.fare)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  body: { gap: spacing.xs },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  bold: { fontWeight: '700' },
  muted: { color: colors.textMuted },
  fare: { color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
});
