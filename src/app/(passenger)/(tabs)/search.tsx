import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import { PlaceInput } from '@/components/search/place-input';
import { RecentSearchItem } from '@/components/search/recent-search-item';
import { TransportBadge } from '@/components/transport/transport-badge';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { colors, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { suggestPlaces } from '@/lib/search-data';
import { selectRecent, useRecentSearchesStore, type RecentSearch } from '@/store/recent-searches-store';
import { useTransportStore } from '@/store/transport-store';

export default function SearchScreen() {
  const router = useRouter();
  const transport = useTransportStore((s) => s.transport);
  const allSearches = useRecentSearchesStore((s) => s.searches);
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const removeSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearSearches = useRecentSearchesStore((s) => s.clearSearches);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const recent = useMemo(() => (transport ? selectRecent(allSearches, transport) : []), [allSearches, transport]);

  if (!transport) return null;
  const option = transportOptions[transport];

  const samePlace = from.trim() !== '' && from.trim().toLowerCase() === to.trim().toLowerCase();
  const fromError = submitted && !from.trim() ? 'Enter where you are leaving from' : undefined;
  const toError = submitted ? (!to.trim() ? 'Enter where you are going' : samePlace ? 'Choose a different place' : undefined) : undefined;

  const go = (fromPlace: string, toPlace: string) => {
    addSearch({ type: transport, from: fromPlace, to: toPlace });
    router.push({ pathname: '/(passenger)/results', params: { from: fromPlace.trim(), to: toPlace.trim() } });
  };

  const submit = () => {
    setSubmitted(true);
    if (!from.trim() || !to.trim() || samePlace) return;
    go(from, to);
  };

  const reuse = (search: RecentSearch) => {
    setFrom(search.from);
    setTo(search.to);
    go(search.from, search.to);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <Screen title="Search">
      <TransportBadge type={transport} />

      <View style={styles.form}>
        <PlaceInput
          label="From"
          icon="map-marker-outline"
          value={from}
          onChangeText={setFrom}
          suggestions={suggestPlaces(transport, from, to)}
          error={fromError}
        />
        <View style={styles.swapRow}>
          <IconButton icon="swap-vertical" mode="contained-tonal" accessibilityLabel="Swap from and to" onPress={swap} />
        </View>
        <PlaceInput
          label="To"
          icon="flag-outline"
          value={to}
          onChangeText={setTo}
          suggestions={suggestPlaces(transport, to, from)}
          error={toError}
        />
      </View>

      <Button mode="contained" buttonColor={option.color} onPress={submit} contentStyle={styles.buttonContent}>
        Search {option.plural.toLowerCase()}
      </Button>

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
  form: { gap: spacing.xs },
  swapRow: { alignItems: 'flex-end', marginVertical: -spacing.sm },
  buttonContent: { paddingVertical: spacing.sm },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { color: colors.textMuted },
});
