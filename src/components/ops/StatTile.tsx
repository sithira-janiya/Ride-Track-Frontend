import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, Emoji } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

type Props = {
  label: string;
  value: string;
  hint?: string;
  /** decorative, beside the number */
  emoji?: string;
  /** position in the row, staggers the entrance */
  index?: number;
};

/** A big number with its label. Lay several out in a wrapping row; each takes about half the width. */
export function StatTile({ label, value, hint, emoji, index = 0 }: Props) {
  const c = useColors();
  return (
    <Animated.View entering={FadeInDown.duration(380).delay(index * 70)} style={styles.tile}>
      <Card style={styles.fill}>
        <View style={styles.top}>
          <Text maxFontSizeMultiplier={1.3} style={[styles.value, { color: c.text }]}>{value}</Text>
          {emoji ? <Emoji symbol={emoji} size={26} /> : null}
        </View>
        <Text style={[styles.label, { color: c.text }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: c.textSecondary }]}>{hint}</Text> : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: '45%' },
  fill: { flexGrow: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  value: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
  label: { ...typography.body, fontWeight: '600' },
  hint: { ...typography.caption },
});
