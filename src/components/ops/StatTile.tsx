import { StyleSheet, Text, View } from 'react-native';

import { Card, type Tone } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { radius, typography } from '@/theme';

type Props = {
  label: string;
  value: string;
  hint?: string;
  /** Emoji shown in a tinted bubble above the number; decorative, hidden from screen readers. */
  icon?: string;
  /** Colour of the icon bubble: a 14% tint of that status colour. */
  tone?: Tone;
};

/** A big number with its label. Lay several out in a wrapping row; each takes about half the width. */
export function StatTile({ label, value, hint, icon, tone = 'info' }: Props) {
  const c = useColors();
  return (
    <Card style={styles.tile}>
      {icon ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.icon, { backgroundColor: `${c[tone]}24` }]}>
          <Text maxFontSizeMultiplier={1.2} style={styles.emoji}>
            {icon}
          </Text>
        </View>
      ) : null}
      <Text maxFontSizeMultiplier={1.3} style={[styles.value, { color: c.text }]}>{value}</Text>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: c.textSecondary }]}>{hint}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: '45%' },
  icon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, lineHeight: 28 },
  value: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
  label: { ...typography.body, fontWeight: '600' },
  hint: { ...typography.caption },
});
