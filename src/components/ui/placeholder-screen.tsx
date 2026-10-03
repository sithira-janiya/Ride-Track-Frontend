import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { colors, spacing } from '@/constants/theme';

type Props = {
  title: string;
  owner: string;
  requirements: string;
  /** Show a back button, for screens opened from another screen. */
  back?: boolean;
};

/**
 * Temporary body for a screen that is not built yet.
 * The owner replaces the whole file with the real screen.
 */
export function PlaceholderScreen({ title, owner, requirements, back }: Props) {
  return (
    <Screen title={title} back={back}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.body}>
          <Text variant="titleMedium">Not built yet</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Owner: {owner}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Requirements: {requirements}
          </Text>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  body: { gap: spacing.xs },
  muted: { color: colors.textMuted },
});
