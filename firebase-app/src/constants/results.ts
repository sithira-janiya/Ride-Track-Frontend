export type SortOption = 'earliest' | 'cheapest' | 'fastest';

export const sortOptions: { value: SortOption; label: string; hint: string }[] = [
  { value: 'earliest', label: 'Earliest departure', hint: 'Leaves soonest in the day first' },
  { value: 'cheapest', label: 'Cheapest', hint: 'Lowest fare first' },
  { value: 'fastest', label: 'Shortest trip', hint: 'Least travel time first' },
];

export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/** Departure windows in whole hours, 24-hour clock. Night wraps past midnight. */
export const dayPeriods: { value: DayPeriod; label: string; hours: string; from: number; to: number }[] = [
  { value: 'morning', label: 'Morning', hours: '5 am to 12 pm', from: 5, to: 12 },
  { value: 'afternoon', label: 'Afternoon', hours: '12 pm to 5 pm', from: 12, to: 17 },
  { value: 'evening', label: 'Evening', hours: '5 pm to 9 pm', from: 17, to: 21 },
  { value: 'night', label: 'Night', hours: '9 pm to 5 am', from: 21, to: 5 },
];

export type DurationBand = 'short' | 'medium' | 'long';

export const durationBands: { value: DurationBand; label: string; minMinutes: number; maxMinutes: number }[] = [
  { value: 'short', label: 'Under 2 hours', minMinutes: 0, maxMinutes: 120 },
  { value: 'medium', label: '2 to 4 hours', minMinutes: 120, maxMinutes: 240 },
  { value: 'long', label: 'Over 4 hours', minMinutes: 240, maxMinutes: Infinity },
];

/** Highest fare the passenger will accept, in LKR. null means any price. */
export const fareLimits: { value: number | null; label: string }[] = [
  { value: null, label: 'Any price' },
  { value: 500, label: 'Up to Rs. 500' },
  { value: 1000, label: 'Up to Rs. 1,000' },
  { value: 1500, label: 'Up to Rs. 1,500' },
];

export type ResultsFilter = {
  sort: SortOption;
  /** Empty means any time of day. */
  periods: DayPeriod[];
  onTimeOnly: boolean;
  maxFare: number | null;
  duration: DurationBand | null;
};

export const defaultResultsFilter: ResultsFilter = {
  sort: 'earliest',
  periods: [],
  onTimeOnly: false,
  maxFare: null,
  duration: null,
};
