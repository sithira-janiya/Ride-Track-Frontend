import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { StatusPill } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import type { Vehicle } from '@/types/models';

/** A nearby vehicle on Home: number, route, next stop and minutes to arrive. */
export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const option = transportOptions[vehicle.type];

  return (
    <SurfaceCard style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={option.icon} size={22} color={option.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text variant="titleSmall" style={styles.number} numberOfLines={1}>
            {vehicle.number}
          </Text>
          <StatusPill status={vehicle.status} />
        </View>
        <Text variant="bodyMedium" style={styles.muted}>
          {vehicle.routeName}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          Next stop: {vehicle.nextStop}
        </Text>
      </View>
      <View style={styles.eta}>
        <Text variant="headlineSmall" style={styles.minutes}>
          {vehicle.etaMinutes}
        </Text>
        <Text variant="labelSmall" style={styles.muted}>
          min
        </Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  number: { fontWeight: '700', flexShrink: 1 },
  muted: { color: colors.textMuted },
  eta: { alignItems: 'center' },
  minutes: { fontWeight: '800', color: colors.primary },
});
