import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';
import type { Route } from '@/types';
import { modeLabel } from '@/utils/format';

type Props = { route: Route; onPress: () => void };

export function RouteCard({ route, onPress }: Props) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${modeLabel(route.mode)} route ${route.routeNo}, ${route.origin} to ${route.destination}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card>
        <View style={styles.row}>
          <Text style={[styles.no, { color: c.primary }]}>{route.routeNo}</Text>
          <StatusBadge label={modeLabel(route.mode)} tone="info" />
        </View>
        <Text style={[styles.name, { color: c.text }]}>{route.name}</Text>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {route.origin} → {route.destination}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  no: { ...typography.title },
  name: { ...typography.bodyLarge, fontWeight: '600' },
  meta: { ...typography.body },
});
