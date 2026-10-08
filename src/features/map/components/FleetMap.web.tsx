import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';

import type { FleetMapProps } from '../types';

/** react-native-maps has no web support, so the browser build shows the vehicle list only. */
export function FleetMap({ vehicles }: FleetMapProps) {
  const c = useColors();
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: c.text }]}>Map view needs the mobile app</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} on the map. The list below shows each one.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16 },
  title: { ...typography.title },
  body: { ...typography.body },
});
