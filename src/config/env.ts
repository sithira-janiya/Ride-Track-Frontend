/** Runtime config. Set in `.env.local` (see `.env.example`); EXPO_PUBLIC_* is inlined at build time. */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000',
  /** true = use the in-memory fake API instead of the RideTrack backend (no server needed). */
  /** Google Cloud Translation API key. Empty = the app stays in English whatever language is picked. */
  googleTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY ?? '',
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
} as const;
