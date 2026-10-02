import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import type { Alert } from '@/types/transport';

function timeAgo(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

export function AlertCard({ alert }: { alert: Alert }) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.row}>
        <Ionicons name="notifications-outline" size={22} color={colors.warning} />
        <View style={styles.info}>
          <Text variant="titleSmall" style={styles.title}>
            {alert.title}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {alert.message}
          </Text>
          <Text variant="labelSmall" style={styles.muted}>
            {timeAgo(alert.minutesAgo)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  row: { flexDirection: 'row', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
