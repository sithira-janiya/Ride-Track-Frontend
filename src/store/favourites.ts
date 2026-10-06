import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavouritesState = {
  routeIds: number[];
  toggle: (routeId: number) => void;
  isFavourite: (routeId: number) => boolean;
};

/** Favourite routes, kept on the device. Shown on the passenger Home screen. */
export const useFavourites = create<FavouritesState>()(
  persist(
    (set, get) => ({
      routeIds: [],
      toggle: (routeId) =>
        set((s) => ({
          routeIds: s.routeIds.includes(routeId) ? s.routeIds.filter((id) => id !== routeId) : [...s.routeIds, routeId],
        })),
      isFavourite: (routeId) => get().routeIds.includes(routeId),
    }),
    { name: 'ridetrack.favourites', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ routeIds: s.routeIds }) },
  ),
);
