import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SavedRoutesState = {
  /** Ids of routes the passenger saved. Saved on the device. */
  routeIds: string[];
  toggleRoute: (id: string) => void;
};

export const useSavedRoutesStore = create<SavedRoutesState>()(
  persist(
    (set) => ({
      routeIds: [],
      toggleRoute: (id) =>
        set((state) => ({
          routeIds: state.routeIds.includes(id) ? state.routeIds.filter((x) => x !== id) : [...state.routeIds, id],
        })),
    }),
    { name: 'ridetrack-saved-routes', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
