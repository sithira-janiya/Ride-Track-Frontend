import { StyleSheet, Text, View } from 'react-native';

import { Card, Emoji, PressableScale, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';
import type { Route } from '@/types';
import { modeEmoji, modeLabel } from '@/utils/format';

type Props = { route: Route; onPress: () => void };

export function RouteCard({ route, onPress }: Props) {
  const c = useColors();
  const t = useT();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t('{mode} route {no}, {from} to {to}', { mode: t(modeLabel(route.mode)), no: route.routeNo, from: route.origin, to: route.destination })}
      onPress={onPress}>
      <Card>
        <View style={styles.row}>
          <View style={styles.title}>
            <Emoji symbol={modeEmoji(route.mode)} size={24} />
            <Text style={[styles.no, { color: c.primary }]}>{route.routeNo}</Text>
          </View>
          <StatusBadge label={modeLabel(route.mode)} tone="info" />
        </View>
        <Text style={[styles.name, { color: c.text }]}>{route.name}</Text>
        <Text style={[styles.meta, { color: c.textSecondary }]}>
          {route.origin} → {route.destination}
        </Text>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  no: { ...typography.title },
  name: { ...typography.bodyLarge, fontWeight: '600' },
  meta: { ...typography.body },
});
