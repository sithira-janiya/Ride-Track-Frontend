import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import type { DayPeriod } from '@/constants/results';
import { toISODate } from '@/lib/format';
import { useRecentSearchesStore } from '@/store/recent-searches-store';
import { useResultsFilterStore } from '@/store/results-filter-store';
import { useTransportStore } from '@/store/transport-store';

type SearchInput = {
  from: string;
  to: string;
  date: Date;
  /** Preferred departure window; leave out for any time. */
  period?: DayPeriod;
};

/** Saves the search to Recent searches, resets filters, applies the preferred time and opens Results. */
export function useStartSearch() {
  const router = useRouter();
  const transport = useTransportStore((s) => s.transport);
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const resetFilters = useResultsFilterStore((s) => s.reset);
  const setPeriods = useResultsFilterStore((s) => s.setPeriods);

  return useCallback(
    ({ from, to, date, period }: SearchInput) => {
      if (!transport) return;
      addSearch({ type: transport, from, to });
      resetFilters();
      if (period) setPeriods([period]);
      router.push({
        pathname: '/(passenger)/results',
        params: { from: from.trim(), to: to.trim(), date: toISODate(date) },
      });
    },
    [transport, addSearch, resetFilters, setPeriods, router],
  );
}
