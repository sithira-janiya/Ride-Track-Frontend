import type { Arrival } from '@/types';

/** A trip that can still be boarded or worked on: not cancelled and not finished. */
export const isRunning = (a: Arrival) => a.status !== 'CANCELLED' && a.status !== 'COMPLETED';

/** Soonest first. */
export const sortByEta = (arrivals: Arrival[]) => [...arrivals].sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());
