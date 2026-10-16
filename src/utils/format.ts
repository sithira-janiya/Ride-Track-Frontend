import type { Operator, Region, Route } from '@/types';

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;
}

/** "Rs. 1,250" for rupees, "AED 7.50" for dirhams. */
export function formatFare(amount: number, currency = 'LKR'): string {
  if (currency === 'LKR') return `Rs. ${amount.toLocaleString('en-LK')}`;
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return `${currency} ${amount.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: 2 })}`;
}

/** Clock time of `iso` in `timeZone` (a route's) when given, otherwise the device's. */
export function formatClock(iso: string, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  try {
    return new Date(iso).toLocaleTimeString([], timeZone ? { ...options, timeZone } : options);
  } catch {
    return new Date(iso).toLocaleTimeString([], options); // an engine without time zone data
  }
}

export const REGION_LABEL: Record<Region, string> = { SRI_LANKA: 'Sri Lanka', DUBAI: 'Dubai' };
export const OPERATOR_LABEL: Record<Operator, string> = { SLTB: 'SLTB', PRIVATE: 'Private', SLR: 'Sri Lanka Railways' };
const ZONE_LABEL: Record<string, string> = { 'Asia/Colombo': 'Sri Lanka time', 'Asia/Dubai': 'Dubai time' };

/** "Dubai time" when the route's clock differs from the device's, so nobody reads a Dubai time as their own. */
export function zoneNote(timeZone: string | undefined): string | null {
  if (!timeZone) return null;
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  try {
    const now = new Date();
    if (now.toLocaleTimeString('en-GB', { ...options, timeZone }) === now.toLocaleTimeString('en-GB', options)) return null;
  } catch {
    return null;
  }
  return ZONE_LABEL[timeZone] ?? `${timeZone.split('/').pop()!.replace(/_/g, ' ')} time`;
}

/** Short name for a route in chips and pickers: "Red to Expo 2020", "138 to Kottawa". */
export const routeLabel = (r: Pick<Route, 'routeNo' | 'destination'>) => `${r.routeNo} to ${r.destination}`;

/** "1 vehicle", "3 vehicles". Pass the plural when it is not just the singular plus "s". */
export const countOf = (n: number, singular: string, plural = `${singular}s`) => `${n} ${n === 1 ? singular : plural}`;

export const modeLabel =(mode: 'BUS' | 'TRAIN') => (mode === 'BUS' ? 'Bus' : 'Train');
