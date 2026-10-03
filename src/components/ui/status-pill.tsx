import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, radius, spacing } from '@/constants/theme';
import type { VehicleStatus } from '@/types/models';

/** Small ON TIME (green) or DELAYED (amber) pill, as in the prototype. */
export function StatusPill({ status }: { status: VehicleStatus }) {
  const delayed = status === 'delayed';
  const tint = delayed ? colors.warning : colors.success;
  return (
    <View style={[styles.pill, { backgroundColor: delayed ? colors.warningBg : colors.successBg }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.text, { color: tint }]}>{delayed ? 'DELAYED' : 'ON TIME'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});
