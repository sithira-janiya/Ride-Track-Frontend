import { create } from 'zustand';

export type ShareStatus = 'off' | 'asking' | 'denied' | 'sharing' | 'error';

type LocationShareState = {
  status: ShareStatus;
  /** when the server last accepted a position from this phone (ms) */
  lastSentAt: number | null;
  error: string | null;
  update: (s: Partial<Omit<LocationShareState, 'update'>>) => void;
};

/** How the driver's phone is doing as the bus's GPS. Written by useLocationSharing, read by the driver screens. */
export const useLocationShare = create<LocationShareState>((set) => ({
  status: 'off',
  lastSentAt: null,
  error: null,
  update: (s) => set(s),
}));
