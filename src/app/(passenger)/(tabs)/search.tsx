import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { RecentSearchItem } from '@/components/search/recent-search-item';
import { SearchForm } from '@/components/search/search-form';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { useStartSearch } from '@/hooks/use-start-search';
import { selectRecent, useRecentSearchesStore, type RecentSearch } from '@/store/recent-searches-store';
import { useTransportStore } from '@/store/transport-store';

export default function SearchScreen() {
  const transport = useTransportStore((s) => s.transport);
  const allSearches = useRecentSearchesStore((s) => s.searches);
  const removeSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearSearches = useRecentSearchesStore((s) => s.clearSearches);
  const startSearch = useStartSearch();

  const recent = useMemo(() => (transport ? selectRecent(allSearches, transport) : []), [allSearches, transport]);

  if (!transport) return null;
  const option = transportOptions[transport];

  const reuse = (search: RecentSearch) => startSearch({ from: search.from, to: search.to, date: new Date() });

  return (
    <Screen
      title="Search Transport"
      subtitle="Find the best journey for you."
      headerExtra={
        <SurfaceCard>
          <SearchForm />
        </SurfaceCard>
      }
    >
      <View style={styles.recentHeader}>
        <SectionHeader title="Recent searches" />
        {recent.length > 0 ? (
          <Button compact onPress={() => clearSearches(transport)}>
            Clear all
          </Button>
        ) : null}
      </View>
      {recent.length === 0 ? (
        <Text style={styles.muted}>Your recent {option.plural.toLowerCase()} searches will show here.</Text>
      ) : (
        recent.map((search) => (
          <RecentSearchItem key={search.id} search={search} onPress={reuse} onRemove={removeSearch} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { color: colors.textMuted, marginBottom: spacing.sm },
});
