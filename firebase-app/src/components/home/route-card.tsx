import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';
import { formatFare } from '@/lib/format';
import type { Route } from '@/types/models';

type Props = {
  route: Route;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

/** A route with its fare and a bookmark to save or unsave it. */
export function RouteCard({ route, saved, onToggleSave }: Props) {
  return (
    <SurfaceCard style={styles.row}>
      <View style={styles.info}>
        <Text variant="titleSmall" style={styles.title}>
          {route.from} to {route.to}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          {route.name} · from {formatFare(route.fare)}
        </Text>
      </View>
      <IconButton
        icon={saved ? 'bookmark' : 'bookmark-outline'}
        iconColor={saved ? colors.primary : colors.textMuted}
        accessibilityLabel={saved ? `Remove ${route.from} to ${route.to} from saved routes` : `Save ${route.from} to ${route.to}`}
        onPress={() => onToggleSave(route.id)}
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
