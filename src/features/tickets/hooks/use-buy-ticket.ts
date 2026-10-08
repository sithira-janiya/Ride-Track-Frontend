import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ticketsApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { useTicketCache } from '@/store/tickets';

import { startPayment } from '../payment';

type Purchase = { tripId: number; boardStopId: number; alightStopId: number };

/** Creates the ticket, takes the passenger through payment, then re-checks it. Resolves with the new ticket's id. */
export function useBuyTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchase: Purchase) => {
      const { addPending, clearPending, upsert } = useTicketCache.getState();
      const session = await ticketsApi.create(purchase);
      // remember it before the payment page opens, so closing the app mid-payment cannot lose it (NFR7)
      addPending(session.ticketId);
      await startPayment(session).catch(() => {});
      const ticket = await ticketsApi.get(session.ticketId).catch(() => null);
      if (ticket) {
        upsert([ticket]);
        if (ticket.status !== 'PENDING') clearPending(session.ticketId);
      }
      return session.ticketId;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all }),
  });
}
