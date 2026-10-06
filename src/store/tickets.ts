import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Ticket } from '@/types';

type TicketsState = {
  /** last known copy of each ticket, so a ticket and its QR still show without signal (NFR10) */
  byId: Record<number, Ticket>;
  /** tickets created but not yet confirmed paid; re-checked on resume so a payment is never lost (NFR7) */
  pendingIds: number[];
  upsert: (tickets: Ticket[]) => void;
  addPending: (id: number) => void;
  clearPending: (id: number) => void;
  /** drop everything on logout so the next user never sees these tickets */
  reset: () => void;
};

export const useTicketCache = create<TicketsState>()(
  persist(
    (set) => ({
      byId: {},
      pendingIds: [],
      upsert: (tickets) =>
        set((s) => {
          const byId = { ...s.byId };
          for (const t of tickets) byId[t.ticketId] = t;
          return { byId };
        }),
      addPending: (id) => set((s) => (s.pendingIds.includes(id) ? s : { pendingIds: [...s.pendingIds, id] })),
      clearPending: (id) => set((s) => ({ pendingIds: s.pendingIds.filter((x) => x !== id) })),
      reset: () => set({ byId: {}, pendingIds: [] }),
    }),
    {
      name: 'ridetrack.tickets',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ byId: s.byId, pendingIds: s.pendingIds }),
    },
  ),
);
