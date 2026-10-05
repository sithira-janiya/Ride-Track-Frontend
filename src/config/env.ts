/** Runtime config. Set in `.env.local` (see `.env.example`); EXPO_PUBLIC_* is inlined at build time. */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3000',
  /** Use the in-memory fake API instead of the backend (the backend does not exist yet). */
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
} as const;
