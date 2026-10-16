import type { Region } from '@/types';

const KNOWN_REGIONS: Region[] = ['SRI_LANKA', 'DUBAI'];

/** "SRI_LANKA,DUBAI" -> both; unknown names are dropped, and an empty list falls back to Sri Lanka. */
export function parseRegions(value: string | undefined): Region[] {
  const picked = (value ?? '').split(',').map((r) => r.trim().toUpperCase()).filter((r): r is Region => KNOWN_REGIONS.includes(r as Region));
  return picked.length ? [...new Set(picked)] : ['SRI_LANKA'];
}

/** Runtime config. Set in `.env.local` (see `.env.example`); EXPO_PUBLIC_* is inlined at build time. */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000',
  /** true = use the in-memory fake API instead of the RideTrack backend (no server needed). */
  /** Google Cloud Translation API key. Empty = the app stays in English whatever language is picked. */
  googleTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY ?? '',
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
  /** Regions this build shows. Sri Lanka only unless EXPO_PUBLIC_REGIONS lists more (e.g. "SRI_LANKA,DUBAI"). */
  regions: parseRegions(process.env.EXPO_PUBLIC_REGIONS),
};
