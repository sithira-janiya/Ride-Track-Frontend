/** Runtime config. Set in `.env.local` (see `.env.example`); EXPO_PUBLIC_* is inlined at build time. */
const useMockApi = (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true';

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000',
  /** Google Cloud Translation API key. Empty = the app stays in English whatever language is picked. */
  googleTranslateApiKey: process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY ?? '',
  /** true = use the in-memory fake API instead of the RideTrack backend (no server needed). */
  useMockApi,
  /** List the demo accounts on the first-launch instructions. Defaults to on in mock mode, where they always exist. */
  showDemoLogins: (process.env.EXPO_PUBLIC_SHOW_DEMO_LOGINS ?? String(useMockApi)) === 'true',
} as const;
