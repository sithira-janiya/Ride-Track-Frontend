export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function formatFare(rupees: number): string {
  return `Rs. ${rupees.toLocaleString('en-LK')}`;
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const modeLabel = (mode: 'BUS' | 'TRAIN') => (mode === 'BUS' ? 'Bus' : 'Train');
