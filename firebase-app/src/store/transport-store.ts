import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TransportType } from '@/constants/transport';

type TransportState = {
  /** What the passenger is travelling by. null until they choose on first launch. */
  transport: TransportType | null;
  /** True once the saved choice has been read from storage. */
  hydrated: boolean;
  setTransport: (transport: TransportType) => void;
  clearTransport: () => void;
};

export const useTransportStore = create<TransportState>()(
  persist(
    (set) => ({
      transport: null,
      hydrated: false,
      setTransport: (transport) => set({ transport }),
      clearTransport: () => set({ transport: null }),
    }),
    {
      name: 'ridetrack-transport',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ transport: state.transport }),
      onRehydrateStorage: () => () => {
        useTransportStore.setState({ hydrated: true });
      },
    },
  ),
);
