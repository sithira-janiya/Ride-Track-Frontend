import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { ticketsApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { useTicketCache } from '@/store/tickets';
import type { Ticket } from '@/types';

/** Paged ticket history (FR11). Every page is written to the on-device cache. */
export function useTicketList(status?: string) {
  const upsert = useTicketCache((s) => s.upsert);
  return useInfiniteQuery({
    queryKey: queryKeys.tickets.list(status),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = await ticketsApi.list(status, pageParam);
      upsert(page.items);
      return page;
    },
    getNextPageParam: (last) => last.nextPage ?? undefined,
  });
}

/** One ticket. The cached copy shows immediately; the server copy replaces it when online (NFR10). */
export function useTicket(id: number) {
  const upsert = useTicketCache((s) => s.upsert);
  const cached = useTicketCache((s) => s.byId[id]);
  return useQuery<Ticket>({
    queryKey: queryKeys.ticket(id),
    queryFn: async () => {
      const t = await ticketsApi.get(id);
      upsert([t]);
      return t;
    },
    placeholderData: cached,
    enabled: Number.isFinite(id),
  });
}

/** Cancels an unused ticket and updates the cached copy, the ticket screen and every ticket list. */
export function useCancelTicket(id: number) {
  const queryClient = useQueryClient();
  const upsert = useTicketCache((s) => s.upsert);
  return useMutation({
    mutationFn: () => ticketsApi.cancel(id),
    onSuccess: (updated) => {
      upsert([updated]);
      queryClient.setQueryData(queryKeys.ticket(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

/**
 * Re-checks every pending payment on mount and whenever the app returns to the foreground,
 * so a payment finished in the browser (or while the app was closed) is picked up (NFR7).
 */
export function usePendingPaymentCheck() {
  const queryClient = useQueryClient();
  const pendingIds = useTicketCache((s) => s.pendingIds);

  const check = useCallback(async () => {
    const { pendingIds: ids, upsert, clearPending } = useTicketCache.getState();
    let changed = false;
    for (const id of ids) {
      try {
        const t = await ticketsApi.get(id);
        upsert([t]);
        if (t.status !== 'PENDING') {
          clearPending(id);
          changed = true;
        }
      } catch {
        // offline or server error: keep it pending and try again next time
      }
    }
    if (changed) queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
  }, [queryClient]);

  useEffect(() => {
    if (pendingIds.length === 0) return;
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, [pendingIds.length, check]);

  return { pendingIds, recheck: check };
}
