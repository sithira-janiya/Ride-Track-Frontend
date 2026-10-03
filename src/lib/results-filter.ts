import { dayPeriods, durationBands, type DayPeriod, type ResultsFilter } from '@/constants/results';
import type { TripResult } from '@/types/models';

import { toMinutes } from './format';

/** Which part of the day a "HH:MM" departure falls in. */
export function periodOf(departure: string): DayPeriod {
  const hour = Math.floor(toMinutes(departure) / 60);
  const match = dayPeriods.find((p) => (p.from < p.to ? hour >= p.from && hour < p.to : hour >= p.from || hour < p.to));
  return match ? match.value : 'night';
}

/** Applies the passenger's filters, then sorts. Returns a new array. */
export function filterAndSort(results: TripResult[], filter: ResultsFilter): TripResult[] {
  const band = durationBands.find((b) => b.value === filter.duration);

  const filtered = results.filter(({ schedule, route }) => {
    if (filter.onTimeOnly && schedule.status !== 'on-time') return false;
    if (filter.periods.length > 0 && !filter.periods.includes(periodOf(schedule.departure))) return false;
    if (filter.maxFare !== null && route.fare > filter.maxFare) return false;
    if (band && (schedule.durationMinutes < band.minMinutes || schedule.durationMinutes >= band.maxMinutes)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (filter.sort === 'cheapest') {
      return a.route.fare - b.route.fare || toMinutes(a.schedule.departure) - toMinutes(b.schedule.departure);
    }
    if (filter.sort === 'fastest') {
      return (
        a.schedule.durationMinutes - b.schedule.durationMinutes ||
        toMinutes(a.schedule.departure) - toMinutes(b.schedule.departure)
      );
    }
    return toMinutes(a.schedule.departure) - toMinutes(b.schedule.departure);
  });
}

/** Number of filters the passenger has turned on (sort is not counted). */
export function activeFilterCount(filter: ResultsFilter): number {
  return (
    (filter.onTimeOnly ? 1 : 0) +
    (filter.periods.length > 0 ? 1 : 0) +
    (filter.maxFare !== null ? 1 : 0) +
    (filter.duration !== null ? 1 : 0)
  );
}
