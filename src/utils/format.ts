export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatFare(rupees: number): string {
  return `Rs. ${rupees.toLocaleString('en-LK')}`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** "1 vehicle", "3 vehicles". Pass the plural when it is not just the singular plus "s". */
export const countOf = (n: number, singular: string, plural = `${singular}s`) => `${n} ${n === 1 ? singular : plural}`;

export const modeLabel = (mode: 'BUS' | 'TRAIN') => (mode === 'BUS' ? 'Bus' : 'Train');

/** Decorative emoji for a transport mode; always shown beside the text label, never instead of it. */
export const modeEmoji = (mode: 'BUS' | 'TRAIN') => (mode === 'BUS' ? '🚌' : '🚆');
