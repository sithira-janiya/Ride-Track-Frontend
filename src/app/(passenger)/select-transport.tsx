import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { colors, spacing } from '@/constants/theme';
import { transportOptions, transportTypes, type TransportType } from '@/constants/transport';
import { useTransportStore } from '@/store/transport-store';

/** First screen a passenger sees: choose bus or train. The choice shapes the rest of the app. */
export default function SelectTransportScreen() {
  const router = useRouter();
  const current = useTransportStore((s) => s.transport);
  const setTransport = useTransportStore((s) => s.setTransport);

  const choose = (type: TransportType) => {
    setTransport(type);
    router.replace('/(passenger)/(tabs)');
  };

  return (
    <Screen
      title="How are you travelling?"
      subtitle="Pick one. Search, results and live tracking will show only this type. You can change it any time."
    >
      <View style={styles.options}>
        {transportTypes.map((type) => {
          const option = transportOptions[type];
          const selected = current === type;
          return (
            <Card
              key={type}
              mode="outlined"
              onPress={() => choose(type)}
              accessibilityRole="button"
              accessibilityLabel={`Travel by ${option.label}`}
              style={[styles.card, selected && { borderColor: option.color, borderWidth: 2 }]}
            >
              <Card.Content style={styles.cardBody}>
                <View style={[styles.iconWrap, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={36} color="#FFFFFF" />
                </View>
                <View style={styles.cardText}>
                  <Text variant="titleLarge" style={styles.cardTitle}>
                    {option.label}
                  </Text>
                  <Text variant="bodyMedium" style={styles.muted}>
                    {option.description}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.md, marginTop: spacing.md },
  card: { backgroundColor: colors.surface },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: spacing.xs },
  cardTitle: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
