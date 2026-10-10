import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, SegmentedButtons, Text } from 'react-native-paper';

import { DateField } from '@/components/search/date-field';
import { PlaceInput } from '@/components/search/place-input';
import { colors, spacing } from '@/constants/theme';
import { dayPeriods, type DayPeriod } from '@/constants/results';
import { transportOptions, transportTypes, type TransportType } from '@/constants/transport';
import { usePlaces } from '@/hooks/use-places';
import { useStartSearch } from '@/hooks/use-start-search';
import { suggestPlaces } from '@/lib/search-data';
import { useTransportStore } from '@/store/transport-store';

// The prototype offers Any time, Morning, Afternoon and Evening when searching.
const searchPeriods = dayPeriods.filter((p) => p.value !== 'night');

/**
 * The journey search card from the prototype: Bus or Train, From, To, travel date, preferred
 * departure time and the search button. Used on Home and on the Search tab.
 */
export function SearchForm() {
  const transport = useTransportStore((s) => s.transport);
  const setTransport = useTransportStore((s) => s.setTransport);
  const startSearch = useStartSearch();
  const places = usePlaces(transport);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [period, setPeriod] = useState<DayPeriod | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  if (!transport) return null;
  const option = transportOptions[transport];

  const samePlace = from.trim() !== '' && from.trim().toLowerCase() === to.trim().toLowerCase();
  const fromError = submitted && !from.trim() ? 'Enter where you are leaving from' : undefined;
  const toError = submitted
    ? !to.trim()
      ? 'Enter where you are going'
      : samePlace
        ? 'Choose a different place'
        : undefined
    : undefined;

  const submit = () => {
    setSubmitted(true);
    if (!from.trim() || !to.trim() || samePlace) return;
    startSearch({ from, to, date, period });
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <View style={styles.form}>
      <SegmentedButtons
        value={transport}
        onValueChange={(value) => setTransport(value as TransportType)}
        buttons={transportTypes.map((type) => ({
          value: type,
          label: transportOptions[type].label,
          icon: transportOptions[type].icon.replace('-outline', ''),
          accessibilityLabel: `Search ${transportOptions[type].plural.toLowerCase()}`,
        }))}
      />

      <PlaceInput
        label="From"
        icon="map-marker-outline"
        value={from}
        onChangeText={setFrom}
        suggestions={suggestPlaces(places, from, to)}
        error={fromError}
      />
      <View style={styles.swapRow}>
        <IconButton icon="swap-vertical" mode="contained-tonal" accessibilityLabel="Swap from and to" onPress={swap} />
      </View>
      <PlaceInput
        label="Destination"
        icon="flag-outline"
        value={to}
        onChangeText={setTo}
        suggestions={suggestPlaces(places, to, from)}
        error={toError}
      />

      <DateField label="Travel date" value={date} onChange={setDate} />

      <View style={styles.periodBlock}>
        <Text variant="labelMedium" style={styles.periodLabel}>
          PREFERRED DEPARTURE TIME
        </Text>
        <View style={styles.chips}>
          <Chip selected={period === undefined} showSelectedCheck={false} onPress={() => setPeriod(undefined)}>
            Any time
          </Chip>
          {searchPeriods.map((p) => (
            <Chip
              key={p.value}
              selected={period === p.value}
              showSelectedCheck={false}
              onPress={() => setPeriod(period === p.value ? undefined : p.value)}
            >
              {p.label}
            </Chip>
          ))}
        </View>
      </View>

      <Button mode="contained" icon="magnify" buttonColor={colors.primaryDark} onPress={submit} contentStyle={styles.buttonContent}>
        Search {option.label}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  swapRow: { alignItems: 'flex-end', marginVertical: -spacing.md },
  periodBlock: { gap: spacing.sm, marginTop: spacing.xs },
  periodLabel: { color: colors.textMuted, letterSpacing: 0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  buttonContent: { paddingVertical: spacing.sm },
});
