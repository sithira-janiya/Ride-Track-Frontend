import type { Stop } from '@/types';

/** Great-circle distance in metres. */
export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(bLat - aLat) / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

/** The stop closest to a position, e.g. where a scanned bus is now (and so where its passenger most likely boarded). */
export function nearestStop(stops: Stop[], lat: number, lng: number): Stop | null {
  let best: Stop | null = null;
  let bestDistance = Infinity;
  for (const s of stops) {
    const d = distanceMeters(lat, lng, s.latitude, s.longitude);
    if (d < bestDistance) {
      best = s;
      bestDistance = d;
    }
  }
  return best;
}
