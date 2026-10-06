import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, ETAChip, OccupancyBar } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { FleetVehicle } from '@/types';
import { modeLabel } from '@/utils/format';

type Props = { vehicle: FleetVehicle; selected?: boolean; onPress?: () => void };

export function VehicleCard({ vehicle: v, selected, onPress }: Props) {
  const c = useColors();
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${modeLabel(v.mode)} ${v.regNo ?? v.vehicleId} on route ${v.routeNo}${selected ? ', selected' : ''}`}
      onPress={onPress}>
      <Card style={selected ? { borderColor: c.primary, borderWidth: 2 } : undefined}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: c.text }]}>
            {v.regNo ?? `Vehicle ${v.vehicleId}`} · Route {v.routeNo}
          </Text>
          <ETAChip eta={v.eta} />
        </View>
        <OccupancyBar passengerCount={v.passengerCount} capacity={v.capacity} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  name: { ...typography.body, fontWeight: '700' },
});
