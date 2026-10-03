import type { TripDetail } from '@/types/models';

import { formatDuration, toMinutes } from './format';

export type StopState = 'departed' | 'upcoming' | 'arrived';

export type TripProgress = {
  phase: 'not-started' | 'in-progress' | 'completed';
  /** One entry per stop, in route order. */
  stopStates: StopState[];
  /** Short sentence for the "current location" card. */
  summary: string;
  nextStopName?: string;
  /** Minutes until the next stop, while the trip is in progress. */
  etaMinutes?: number;
};

/**
 * Where a trip is at a given time of day (minutes since midnight).
 * Sample data has no GPS, so this is worked out from the timetable only.
 */
export function getTripProgress(detail: TripDetail, nowMinutes: number): TripProgress {
  const start = toMinutes(detail.schedule.departure);
  const end = start + detail.schedule.durationMinutes;
  const times = detail.stopTimes.map(({ stop }) => start + Math.round(stop.at * detail.schedule.durationMinutes));

  if (nowMinutes < start) {
    return {
      phase: 'not-started',
      stopStates: times.map(() => 'upcoming'),
      summary: `Not departed yet. Leaves in ${formatDuration(start - nowMinutes)}.`,
      nextStopName: detail.stopTimes[0]?.stop.name,
    };
  }

  if (nowMinutes >= end) {
    return {
      phase: 'completed',
      stopStates: times.map(() => 'arrived'),
      summary: 'Journey completed.',
    };
  }

  const stopStates: StopState[] = times.map((t) => (t <= nowMinutes ? 'departed' : 'upcoming'));
  const nextIndex = stopStates.indexOf('upcoming');
  const lastPassed = nextIndex > 0 ? detail.stopTimes[nextIndex - 1].stop.name : detail.stopTimes[0]?.stop.name;
  const next = nextIndex >= 0 ? detail.stopTimes[nextIndex].stop.name : undefined;

  return {
    phase: 'in-progress',
    stopStates,
    summary: next ? `Between ${lastPassed} and ${next}.` : `Near ${lastPassed}.`,
    nextStopName: next,
    etaMinutes: nextIndex >= 0 ? times[nextIndex] - nowMinutes : undefined,
  };
}
