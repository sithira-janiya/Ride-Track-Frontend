import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';

import type { LiveMapProps } from '../types';

/** react-native-maps has no web support, so the browser build shows a notice instead of a map. */
export function LiveMap({ vehicles }: LiveMapProps) {
  const c = useColors();
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: c.text }]}>Map view needs the mobile app</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} tracked on this route. Open the app on your phone to see them on the map.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: 16 },
  title: { ...typography.title },
  body: { ...typography.body },
});
