import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { TransportBadge } from '@/components/transport/transport-badge';
import { colors, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { useTransportStore } from '@/store/transport-store';

export default function SearchScreen() {
  const transport = useTransportStore((s) => s.transport);

  if (!transport) return null;

  return (
    <Screen title="Search">
      <TransportBadge type={transport} />
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.body}>
          <Text variant="titleMedium">Not built yet</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Owner: Silva. Requirements: FR3, FR4.
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            This screen must search {transportOptions[transport].plural.toLowerCase()} only: every query filters by{' '}
            type = {transport}.
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
