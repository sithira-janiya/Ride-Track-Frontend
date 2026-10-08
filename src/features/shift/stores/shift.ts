import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Shift = { routeId: number; routeNo: string; tripId: number; vehicleId: number; startedAt: string };

type ShiftState = {
  shift: Shift | null;
  start: (s: Omit<Shift, 'startedAt'>) => void;
  end: () => void;
};

/** The vehicle and trip the staff member is working on, kept so the app reopens ready to scan. */
export const useShift = create<ShiftState>()(
  persist(
    (set) => ({
      shift: null,
      start: (s) => set({ shift: { ...s, startedAt: new Date().toISOString() } }),
      end: () => set({ shift: null }),
    }),
    { name: 'ridetrack.shift', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ shift: s.shift }) },
  ),
);
