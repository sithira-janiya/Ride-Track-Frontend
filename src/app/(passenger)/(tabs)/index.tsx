import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { TransportBadge } from '@/components/transport/transport-badge';
import { colors, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { useTransportStore } from '@/store/transport-store';

export default function HomeScreen() {
  const router = useRouter();
  const transport = useTransportStore((s) => s.transport);

  if (!transport) return null;
  const option = transportOptions[transport];

  return (
    <Screen title="Home">
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.body}>
          <TransportBadge type={transport} />
          <Text variant="titleLarge" style={styles.title}>
            Travelling by {option.label.toLowerCase()}
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Search and live tracking show {option.plural.toLowerCase()} only.
          </Text>
          <View style={styles.actions}>
            <Button mode="contained" buttonColor={option.color} onPress={() => router.push('/(passenger)/(tabs)/search')}>
              Search {option.plural.toLowerCase()}
            </Button>
            <Button mode="outlined" onPress={() => router.push('/(passenger)/select-transport')}>
              Change transport
            </Button>
          </View>
        </Card.Content>
      </Card>
      <Text variant="bodySmall" style={styles.muted}>
        Home is still a starter screen: nearby vehicles, saved routes and alerts will be added here.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface },
  body: { gap: spacing.sm },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
