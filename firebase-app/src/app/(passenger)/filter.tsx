import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, RadioButton, Switch, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { dayPeriods, durationBands, fareLimits, sortOptions, type SortOption } from '@/constants/results';
import { colors, spacing } from '@/constants/theme';
import { activeFilterCount } from '@/lib/results-filter';
import { useResultsFilterStore } from '@/store/results-filter-store';

/** Filter & Sort sheet. Changes apply to the Results list straight away; Show results just closes it. */
export default function FilterScreen() {
  const router = useRouter();
  const filter = useResultsFilterStore((s) => s.filter);
  const setSort = useResultsFilterStore((s) => s.setSort);
  const togglePeriod = useResultsFilterStore((s) => s.togglePeriod);
  const setPeriods = useResultsFilterStore((s) => s.setPeriods);
  const setOnTimeOnly = useResultsFilterStore((s) => s.setOnTimeOnly);
  const setMaxFare = useResultsFilterStore((s) => s.setMaxFare);
  const setDuration = useResultsFilterStore((s) => s.setDuration);
  const reset = useResultsFilterStore((s) => s.reset);

  const count = activeFilterCount(filter);

  return (
    <Screen
      title="Filter & Sort"
      subtitle={count === 0 ? '0 filters selected' : `${count} ${count === 1 ? 'filter' : 'filters'} selected`}
      back
    >
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

      <SectionHeader title="Fare" hint="Highest price you will pay per passenger" />
      <View style={styles.chips}>
        {fareLimits.map((limit) => (
          <Chip
            key={limit.label}
            selected={filter.maxFare === limit.value}
            showSelectedCheck={false}
            onPress={() => setMaxFare(limit.value)}
          >
            {limit.label}
          </Chip>
        ))}
      </View>

      <SectionHeader title="Departure time" />
      <View style={styles.chips}>
        <Chip selected={filter.periods.length === 0} showSelectedCheck={false} onPress={() => setPeriods([])}>
          Any time
        </Chip>
        {dayPeriods.map((period) => (
          <Chip
            key={period.value}
            selected={filter.periods.includes(period.value)}
            showSelectedCheck={false}
            onPress={() => togglePeriod(period.value)}
          >
            {period.label}
          </Chip>
        ))}
      </View>

      <SectionHeader title="Duration" />
      <View style={styles.chips}>
        {durationBands.map((band) => (
          <Chip
            key={band.value}
            selected={filter.duration === band.value}
            showSelectedCheck={false}
            onPress={() => setDuration(filter.duration === band.value ? null : band.value)}
          >
            {band.label}
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
        <Button mode="contained" buttonColor={colors.primaryDark} onPress={() => router.back()} style={styles.action}>
          Show results
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
