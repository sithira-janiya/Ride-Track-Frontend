import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, RadioButton, Switch, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { dayPeriods, sortOptions, type SortOption } from '@/constants/results';
import { colors, spacing } from '@/constants/theme';
import { useResultsFilterStore } from '@/store/results-filter-store';

/** Filter & Sort sheet. Changes apply to the Results list straight away; Done just closes it. */
export default function FilterScreen() {
  const router = useRouter();
  const filter = useResultsFilterStore((s) => s.filter);
  const setSort = useResultsFilterStore((s) => s.setSort);
  const togglePeriod = useResultsFilterStore((s) => s.togglePeriod);
  const setOnTimeOnly = useResultsFilterStore((s) => s.setOnTimeOnly);
  const reset = useResultsFilterStore((s) => s.reset);

  return (
    <Screen title="Filter & sort">
      <SectionHeader title="Sort by" />
      <RadioButton.Group onValueChange={(value) => setSort(value as SortOption)} value={filter.sort}>
        {sortOptions.map((option) => (
          <RadioButton.Item
            key={option.value}
            value={option.value}
            label={option.label}
            labelVariant="bodyLarge"
            style={styles.radio}
          />
        ))}
      </RadioButton.Group>

      <SectionHeader title="Departure time" hint="Pick none to see every time of day" />
      <View style={styles.chips}>
        {dayPeriods.map((period) => (
          <Chip
            key={period.value}
            selected={filter.periods.includes(period.value)}
            showSelectedCheck
            onPress={() => togglePeriod(period.value)}
          >
            {period.label} ({period.hours})
          </Chip>
        ))}
      </View>

      <SectionHeader title="Service" />
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">On time only</Text>
        <Switch value={filter.onTimeOnly} onValueChange={setOnTimeOnly} />
      </View>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={reset} style={styles.action}>
          Reset
        </Button>
        <Button mode="contained" onPress={() => router.back()} style={styles.action}>
          Done
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  radio: { paddingHorizontal: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  action: { flex: 1 },
});
