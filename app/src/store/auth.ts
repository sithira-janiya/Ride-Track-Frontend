import { create } from 'zustand';

import { useTicketCache } from '@/store/tickets';
import type { AuthResult, AuthTokens, User } from '@/types';
import { getItem, removeItem, setItem } from '@/utils/secure-storage';

const KEY = 'ridetrack.session';

type Session = { user: User } & AuthTokens;

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** false until the persisted session has been read on app start */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (r: AuthResult) => Promise<void>;
  setTokens: (t: AuthTokens) => Promise<void>;
  setUser: (u: User) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => {
  const persist = async () => {
    const { user, accessToken, refreshToken } = get();
    if (user && accessToken && refreshToken) {
      const session: Session = { user, accessToken, refreshToken };
      await setItem(KEY, JSON.stringify(session));
    }
  };

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    hydrated: false,

    hydrate: async () => {
      try {
        const raw = await getItem(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Session;
          set({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken });
        }
      } finally {
        set({ hydrated: true });
      }
    },

    setSession: async (r) => {
      set({ user: r.user, accessToken: r.accessToken, refreshToken: r.refreshToken });
      await persist();
    },

    setTokens: async (t) => {
      set({ accessToken: t.accessToken, refreshToken: t.refreshToken });
      await persist();
    },

    setUser: async (user) => {
      set({ user });
      await persist();
    },

    logout: async () => {
      set({ user: null, accessToken: null, refreshToken: null });
      useTicketCache.getState().reset(); // tickets belong to the account, not the device
      await removeItem(KEY);
    },
  };
});
