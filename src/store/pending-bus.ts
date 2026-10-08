import { create } from 'zustand';

type PendingBusState = {
  /** a scanned bus to open once the right screens are mounted (from the Play install referrer, or kept across login) */
  code: string | null;
  /** true when the passenger left the bus screen to log in: open it again only once they are signed in */
  afterLogin: boolean;
  open: (code: string, options?: { afterLogin?: boolean }) => void;
  clear: () => void;
};

/** A bus waiting to be shown (memory only; see useOpenPendingBus). */
export const usePendingBus = create<PendingBusState>((set) => ({
  code: null,
  afterLogin: false,
  open: (code, { afterLogin = false } = {}) => set({ code, afterLogin }),
  clear: () => set({ code: null, afterLogin: false }),
}));
