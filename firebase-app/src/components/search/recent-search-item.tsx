import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';
import type { RecentSearch } from '@/store/recent-searches-store';

type Props = {
  search: RecentSearch;
  onPress: (search: RecentSearch) => void;
  onRemove: (id: string) => void;
};

/** One row in the recent searches list: tap to search again, X to delete. */
export function RecentSearchItem({ search, onPress, onRemove }: Props) {
  return (
    <SurfaceCard
      onPress={() => onPress(search)}
      accessibilityLabel={`Search ${search.from} to ${search.to} again`}
      style={styles.card}
    >
      <View style={styles.row}>
        <IconButton icon="history" size={18} iconColor={colors.textMuted} style={styles.icon} />
        <Text variant="bodyLarge" style={styles.text} numberOfLines={1}>
          {search.from} to {search.to}
        </Text>
        <IconButton
          icon="close"
          size={18}
          accessibilityLabel={`Remove ${search.from} to ${search.to} from recent searches`}
          onPress={() => onRemove(search.id)}
        />
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 0, paddingHorizontal: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { margin: 0 },
  text: { flex: 1, marginHorizontal: spacing.xs },
});
