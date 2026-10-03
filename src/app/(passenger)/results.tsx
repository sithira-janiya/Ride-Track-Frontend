import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Text } from 'react-native-paper';

import { ResultCard } from '@/components/results/result-card';
import { Screen } from '@/components/ui/screen';
import { colors, spacing } from '@/constants/theme';
import { sortOptions } from '@/constants/results';
import { transportOptions } from '@/constants/transport';
import { formatDateShort, fromISODate } from '@/lib/format';
import { activeFilterCount, filterAndSort } from '@/lib/results-filter';
import { getResults } from '@/lib/search-data';
import { useResultsFilterStore } from '@/store/results-filter-store';
import { useTransportStore } from '@/store/transport-store';

export default function ResultsScreen() {
  const router = useRouter();
  const { from = '', to = '', date } = useLocalSearchParams<{ from: string; to: string; date?: string }>();
  const transport = useTransportStore((s) => s.transport);
  const filter = useResultsFilterStore((s) => s.filter);
  const resetFilters = useResultsFilterStore((s) => s.reset);

  const all = useMemo(() => (transport ? getResults(transport, from, to) : []), [transport, from, to]);
  const shown = useMemo(() => filterAndSort(all, filter), [all, filter]);

  if (!transport) return null;
  const option = transportOptions[transport];
  const activeCount = activeFilterCount(filter);
  const sortLabel = sortOptions.find((o) => o.value === filter.sort)?.label ?? '';

  return (
    <Screen
      title="Available Transport"
      subtitle={`${from} → ${to} • ${formatDateShort(fromISODate(date))}`}
      back
    >
      <View style={styles.toolbar}>
        <View style={styles.toolbarText}>
          <Text variant="titleSmall" style={styles.bold}>
            {shown.length} {shown.length === 1 ? 'journey' : 'journeys'} found
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {all.length > shown.length ? `${all.length - shown.length} hidden by filters · ` : ''}Sorted by {sortLabel.toLowerCase()}
          </Text>
        </View>
        <View>
          <Button mode="contained-tonal" icon="tune-variant" onPress={() => router.push('/(passenger)/filter')}>
            Filter & Sort
          </Button>
          {activeCount > 0 ? <Badge style={styles.badge}>{activeCount}</Badge> : null}
        </View>
      </View>

      {all.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="titleMedium">No {option.plural.toLowerCase()} found</Text>
          <Text style={styles.muted}>
            We could not find a {option.label.toLowerCase()} between {from} and {to}. Check the spelling or try another place.
          </Text>
          <Button mode="contained" buttonColor={colors.primaryDark} onPress={() => router.back()}>
            Change search
          </Button>
        </View>
      ) : shown.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="titleMedium">Nothing matches your filters</Text>
          <Text style={styles.muted}>Try removing a filter to see more {option.plural.toLowerCase()}.</Text>
          <Button mode="outlined" onPress={resetFilters}>
            Clear filters
          </Button>
        </View>
      ) : (
        shown.map((result) => (
          <ResultCard
            key={result.schedule.id}
            result={result}
            onPress={() => router.push({ pathname: '/(passenger)/transport/[id]', params: { id: result.schedule.id, date } })}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  toolbarText: { flex: 1, gap: 2 },
  badge: { position: 'absolute', top: -6, right: -6 },
  empty: { gap: spacing.sm, paddingVertical: spacing.lg },
  bold: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
