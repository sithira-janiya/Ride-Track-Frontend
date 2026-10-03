import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import type { Alert } from '@/types/models';

function timeAgo(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

/** An authority alert, with an amber icon tile. */
export function AlertCard({ alert }: { alert: Alert }) {
  return (
    <SurfaceCard style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="notifications-outline" size={20} color={colors.warning} />
      </View>
      <View style={styles.info}>
        <Text variant="titleSmall" style={styles.title}>
          {alert.title}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          {alert.message}
        </Text>
        <Text variant="labelSmall" style={styles.muted}>
          {timeAgo(alert.minutesAgo)}
        </Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
