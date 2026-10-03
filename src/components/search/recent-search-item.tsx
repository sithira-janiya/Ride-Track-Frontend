import { StyleSheet } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';
import type { RecentSearch } from '@/store/recent-searches-store';

type Props = {
  search: RecentSearch;
  onPress: (search: RecentSearch) => void;
  onRemove: (id: string) => void;
};

/** One row in the recent searches list: tap to reuse, bin to delete. */
export function RecentSearchItem({ search, onPress, onRemove }: Props) {
  return (
    <Card mode="outlined" style={styles.card} onPress={() => onPress(search)}>
      <Card.Content style={styles.row}>
        <Text variant="bodyLarge" style={styles.text} numberOfLines={1}>
          {search.from} to {search.to}
        </Text>
        <IconButton
          icon="close"
          size={18}
          accessibilityLabel={`Remove ${search.from} to ${search.to} from recent searches`}
          onPress={() => onRemove(search.id)}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0 },
  text: { flex: 1, marginRight: spacing.sm },
});
