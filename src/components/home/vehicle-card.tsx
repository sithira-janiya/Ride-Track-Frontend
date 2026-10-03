import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import type { Vehicle } from '@/types/models';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const option = transportOptions[vehicle.type];
  const delayed = vehicle.status === 'delayed';
  const statusColor = delayed ? colors.warning : colors.success;

  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.row}>
        <View style={[styles.icon, { backgroundColor: option.color }]}>
          <Ionicons name={option.icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.info}>
          <Text variant="titleSmall" style={styles.number}>
            {vehicle.number}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {vehicle.routeName}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Next stop: {vehicle.nextStop}
          </Text>
        </View>
        <View style={styles.eta}>
          <Text variant="titleLarge" style={styles.minutes}>
            {vehicle.etaMinutes}
          </Text>
          <Text variant="labelSmall" style={styles.muted}>
            min
          </Text>
          <Text variant="labelSmall" style={[styles.status, { color: statusColor }]}>
            {delayed ? 'Delayed' : 'On time'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  number: { fontWeight: '700' },
  muted: { color: colors.textMuted },
  eta: { alignItems: 'center' },
  minutes: { fontWeight: '800', color: colors.text },
  status: { fontWeight: '700', marginTop: 2 },
});
