import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, IconButton, Text } from 'react-native-paper';

import { ResultCard } from '@/components/results/result-card';
import { TransportBadge } from '@/components/transport/transport-badge';
import { Screen } from '@/components/ui/screen';
import { colors, spacing } from '@/constants/theme';
import { sortOptions } from '@/constants/results';
import { transportOptions } from '@/constants/transport';
import { activeFilterCount, filterAndSort } from '@/lib/results-filter';
import { getResults } from '@/lib/search-data';
import { useResultsFilterStore } from '@/store/results-filter-store';
import { useTransportStore } from '@/store/transport-store';

export default function ResultsScreen() {
  const router = useRouter();
  const { from = '', to = '' } = useLocalSearchParams<{ from: string; to: string }>();
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
    <Screen title={`${from} to ${to}`}>
      <View style={styles.top}>
        <IconButton icon="arrow-left" accessibilityLabel="Back to search" onPress={() => router.back()} style={styles.back} />
        <TransportBadge type={transport} />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.toolbarText}>
          <Text variant="bodyMedium">
            {shown.length} of {all.length} {option.plural.toLowerCase()}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Sorted by {sortLabel.toLowerCase()}
          </Text>
        </View>
        <View>
          <Button mode="outlined" icon="tune-variant" onPress={() => router.push('/(passenger)/filter')}>
            Filter & sort
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
          <Button mode="contained" buttonColor={option.color} onPress={() => router.back()}>
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
        shown.map((result) => <ResultCard key={result.schedule.id} result={result} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  back: { margin: 0 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  toolbarText: { flex: 1 },
  badge: { position: 'absolute', top: -6, right: -6 },
  empty: { gap: spacing.sm, paddingVertical: spacing.lg },
  muted: { color: colors.textMuted },
});
