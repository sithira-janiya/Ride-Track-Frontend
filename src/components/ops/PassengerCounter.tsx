import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, ErrorMessage, OccupancyBar } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

type Props = {
  /** the count the server has; undefined when none was reported yet */
  count: number | undefined;
  capacity: number;
  onSave: (count: number) => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
  /** called when the draft changes, e.g. to clear an old "saved" or error message */
  onEdit?: () => void;
};

/** On-board passenger count (FR7): quick ±1 / ±5 steps on a local draft, sent once with Save. Used by staff and drivers. */
export function PassengerCounter({ count, capacity, onSave, saving, saved, error, onEdit }: Props) {
  const c = useColors();
  const [draft, setDraft] = useState(count ?? 0);
  // a new count from the server replaces the draft
  const [seen, setSeen] = useState(count);
  if (count !== seen) {
    setSeen(count);
    setDraft(count ?? 0);
  }

  const change = (delta: number) => {
    setDraft((d) => Math.max(0, Math.min(capacity || Infinity, d + delta)));
    onEdit?.();
  };
  const dirty = draft !== count;

  return (
    <View style={styles.wrap}>
      <Card>
        <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.2} style={[styles.count, { color: c.text }]}>
          {draft}
          <Text style={[styles.of, { color: c.textSecondary }]}> / {capacity}</Text>
        </Text>
        <OccupancyBar passengerCount={draft} capacity={capacity} />
      </Card>

      <View style={styles.row}>
        <Button title="− 1" variant="secondary" onPress={() => change(-1)} style={styles.step} />
        <Button title="+ 1" variant="secondary" onPress={() => change(1)} style={styles.step} />
      </View>
      <View style={styles.row}>
        <Button title="− 5" variant="secondary" onPress={() => change(-5)} style={styles.step} />
        <Button title="+ 5" variant="secondary" onPress={() => change(5)} style={styles.step} />
      </View>

      {error ? <ErrorMessage message={error} /> : null}
      {saved && !dirty ? (
        <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
          ✓ Count saved
        </Text>
      ) : null}
      <Button title="Save count" loading={saving} disabled={!dirty} onPress={() => onSave(draft)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  body: { ...typography.body },
  count: { fontSize: 64, lineHeight: 72, fontWeight: '800', textAlign: 'center' },
  of: { ...typography.title },
  row: { flexDirection: 'row', gap: spacing.md },
  step: { flex: 1 },
});
