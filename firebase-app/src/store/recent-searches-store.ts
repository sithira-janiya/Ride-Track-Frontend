import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TransportType } from '@/constants/transport';

export type RecentSearch = {
  id: string;
  type: TransportType;
  from: string;
  to: string;
};

const MAX_RECENT = 8;

type RecentSearchesState = {
  /** Newest first. Saved on the device, kept separately for buses and trains. */
  searches: RecentSearch[];
  addSearch: (search: Omit<RecentSearch, 'id'>) => void;
  removeSearch: (id: string) => void;
  clearSearches: (type: TransportType) => void;
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: ({ type, from, to }) =>
        set((state) => {
          const rest = state.searches.filter((s) => !(s.type === type && same(s.from, from) && same(s.to, to)));
          const entry: RecentSearch = { id: `${Date.now()}`, type, from: from.trim(), to: to.trim() };
          return { searches: [entry, ...rest].slice(0, MAX_RECENT * 2) };
        }),
      removeSearch: (id) => set((state) => ({ searches: state.searches.filter((s) => s.id !== id) })),
      clearSearches: (type) => set((state) => ({ searches: state.searches.filter((s) => s.type !== type) })),
    }),
    { name: 'ridetrack-recent-searches', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Recent searches for one transport type, newest first, capped for display. */
export function selectRecent(searches: RecentSearch[], type: TransportType): RecentSearch[] {
  return searches.filter((s) => s.type === type).slice(0, MAX_RECENT);
}
