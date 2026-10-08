import type { Tone } from '@/components/ui';
import { fill, type Translate } from '@/i18n';
import type { Ticket, TicketStatus } from '@/types';

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Payment pending', tone: 'warning' },
  ACTIVE: { label: 'Ready to use', tone: 'success' },
  USED: { label: 'Used', tone: 'info' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
};

export function ticketTitle(ticket: Ticket, t: Translate = fill) {
  return ticket.routeNo ? t('Route {no}', { no: ticket.routeNo }) : t('Trip {id}', { id: ticket.tripId });
}

export function ticketJourney(ticket: Ticket, t: Translate = fill) {
  const stop = (name: string | null | undefined, id: number) => name ?? t('Stop {n}', { n: id });
  return `${stop(ticket.boardStopName, ticket.boardStopId)} → ${stop(ticket.alightStopName, ticket.alightStopId)}`;
}
