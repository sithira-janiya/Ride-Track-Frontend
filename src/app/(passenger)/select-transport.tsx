import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions, transportTypes, type TransportType } from '@/constants/transport';
import { useTransportStore } from '@/store/transport-store';

const tagline: Record<TransportType, string> = {
  bus: 'Islandwide bus routes',
  train: 'Sri Lankan railway network',
};

/** First screen a passenger sees: choose bus or train, then Continue. The choice shapes the rest of the app. */
export default function SelectTransportScreen() {
  const router = useRouter();
  const current = useTransportStore((s) => s.transport);
  const setTransport = useTransportStore((s) => s.setTransport);
  const [selected, setSelected] = useState<TransportType>(current ?? 'bus');

  const next = () => {
    setTransport(selected);
    router.replace('/(passenger)/(tabs)');
  };

  return (
    <Screen
      title="Select Transport"
      subtitle="How would you like to travel? Search and tracking will show only this type. You can change it any time."
      back={router.canGoBack()}
    >
      <View style={styles.options}>
        {transportTypes.map((type) => {
          const option = transportOptions[type];
          const isSelected = selected === type;
          return (
            <SurfaceCard
              key={type}
              onPress={() => setSelected(type)}
              accessibilityLabel={`Travel by ${option.label}${isSelected ? ', selected' : ''}`}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name={option.icon} size={34} color={option.color} />
                </View>
                {isSelected ? (
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
              <Text variant="headlineSmall" style={styles.title}>
                {option.label}
              </Text>
              <Text variant="bodyMedium" style={styles.muted}>
                {option.description}
              </Text>
              <View style={styles.tagRow}>
                <Ionicons name="globe-outline" size={14} color={colors.primary} />
                <Text variant="labelMedium" style={styles.tag}>
                  {tagline[type]}
                </Text>
              </View>
            </SurfaceCard>
          );
        })}
      </View>

      <Button mode="contained" buttonColor={colors.primaryDark} onPress={next} contentStyle={styles.buttonContent}>
        Continue
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.md, marginTop: spacing.sm },
  card: { gap: spacing.xs, padding: spacing.lg, borderWidth: 2, borderColor: colors.border },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  tag: { color: colors.primary },
  buttonContent: { paddingVertical: spacing.sm },
});
