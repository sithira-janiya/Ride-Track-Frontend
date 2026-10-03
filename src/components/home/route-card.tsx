import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import type { Route } from '@/types/models';

type Props = {
  route: Route;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function RouteCard({ route, saved, onToggleSave }: Props) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.row}>
        <View style={styles.info}>
          <Text variant="titleSmall" style={styles.title}>
            {route.from} to {route.to}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {route.name} · from LKR {route.fare}
          </Text>
        </View>
        <IconButton
          icon={saved ? 'bookmark' : 'bookmark-outline'}
          iconColor={saved ? colors.primary : colors.textMuted}
          accessibilityLabel={saved ? `Remove ${route.from} to ${route.to} from saved routes` : `Save ${route.from} to ${route.to}`}
          onPress={() => onToggleSave(route.id)}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
