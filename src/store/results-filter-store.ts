import { create } from 'zustand';

import { defaultResultsFilter, type DayPeriod, type ResultsFilter, type SortOption } from '@/constants/results';

type ResultsFilterState = {
  filter: ResultsFilter;
  setSort: (sort: SortOption) => void;
  togglePeriod: (period: DayPeriod) => void;
  setOnTimeOnly: (value: boolean) => void;
  reset: () => void;
};

/** Current Results sort and filters. Lives only while the app is open; every new search starts fresh. */
export const useResultsFilterStore = create<ResultsFilterState>()((set) => ({
  filter: defaultResultsFilter,
  setSort: (sort) => set((s) => ({ filter: { ...s.filter, sort } })),
  togglePeriod: (period) =>
    set((s) => ({
      filter: {
        ...s.filter,
        periods: s.filter.periods.includes(period)
          ? s.filter.periods.filter((p) => p !== period)
          : [...s.filter.periods, period],
      },
    })),
  setOnTimeOnly: (onTimeOnly) => set((s) => ({ filter: { ...s.filter, onTimeOnly } })),
  reset: () => set({ filter: defaultResultsFilter }),
}));
