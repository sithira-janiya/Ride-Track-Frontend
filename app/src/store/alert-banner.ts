import { create } from 'zustand';

type BannerState = {
  message: string | null;
  show: (message: string) => void;
  dismiss: () => void;
};

/** The in-app banner shown when `alert:new` arrives while the app is open (FR8). Not persisted. */
export const useAlertBanner = create<BannerState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  dismiss: () => set({ message: null }),
}));
