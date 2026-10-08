import { StyleSheet, Text } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { typography } from '@/theme';

import { Card } from './Card';

/** A big number with its label. Lay several out in a wrapping row; each takes about half the width. */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const c = useColors();
  return (
    <Card style={styles.tile}>
      <Text maxFontSizeMultiplier={1.3} style={[styles.value, { color: c.text }]}>{value}</Text>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: c.textSecondary }]}>{hint}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flexGrow: 1, flexBasis: '45%' },
  value: { fontSize: 36, lineHeight: 42, fontWeight: '800' },
  label: { ...typography.body, fontWeight: '600' },
  hint: { ...typography.caption },
});
