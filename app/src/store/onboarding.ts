import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
  /** true once the "how RideTrack works" instructions have been seen on this device */
  seenWelcome: boolean;
  finishWelcome: () => void;
};

/**
 * First-launch instructions. Someone who has just scanned the app's QR code (web or Expo Go) sees them before the
 * login screen; afterwards they stay reachable from the login screen's "How RideTrack works" link.
 */
export const useOnboarding = create<OnboardingState>()(
  persist((set) => ({ seenWelcome: false, finishWelcome: () => set({ seenWelcome: true }) }), {
    name: 'ridetrack.onboarding',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);
