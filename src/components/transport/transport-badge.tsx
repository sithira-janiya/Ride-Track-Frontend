import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { transportOptions, type TransportType } from '@/constants/transport';
import { radius, spacing } from '@/constants/theme';

/** Small pill showing which transport type the passenger is browsing. */
export function TransportBadge({ type }: { type: TransportType }) {
  const option = transportOptions[type];
  return (
    <View style={[styles.badge, { backgroundColor: option.color }]}>
      <Ionicons name={option.icon} size={16} color="#FFFFFF" />
      <Text style={styles.text}>{option.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  text: { color: '#FFFFFF', fontWeight: '600' },
});
