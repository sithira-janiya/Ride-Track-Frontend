/** "05:30" to minutes since midnight. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Minutes since midnight to "05:30"; wraps past midnight. */
export function toClock(totalMinutes: number): string {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 215 to "3h 35m", 45 to "45m". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Fare in Sri Lankan rupees, for example "Rs. 1,400". */
export function formatFare(fare: number): string {
  return `Rs. ${fare.toLocaleString('en-US')}`;
}
