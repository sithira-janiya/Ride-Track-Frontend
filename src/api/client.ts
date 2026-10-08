import axios, { AxiosError, isAxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { useAuth } from '@/store/auth';
import type { ApiError, ApiSuccess, AuthTokens } from '@/types';

export const api = axios.create({ baseURL: env.apiUrl, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type Retryable = InternalAxiosRequestConfig & { _retried?: boolean };

// A single in-flight refresh is shared by all requests that fail with 401 at the same time.
let refreshing: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  const { refreshToken, user } = useAuth.getState();
  if (!refreshToken) throw new Error('No refresh token');
  // driver sessions only refresh at the driver endpoint; the app endpoint refuses their tokens (and vice versa)
  const path = user?.role === 'DRIVER' ? '/driver/auth/refresh' : '/auth/refresh';
  // plain axios: this call must not go through the interceptors below
  const res = await axios.post<ApiSuccess<AuthTokens>>(`${env.apiUrl}${path}`, { refreshToken });
  return res.data.data;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as Retryable | undefined;
    const isAuthCall = /^\/(driver\/)?auth\//.test(original?.url ?? '');

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshing ??= refreshTokens().finally(() => (refreshing = null));
        const tokens = await refreshing;
        await useAuth.getState().setTokens(tokens);
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        await useAuth.getState().logout(); // refresh failed: session is over
      }
    }
    return Promise.reject(error);
  },
);

/** Turns any thrown value into a message that is safe to show the user (NFR7). */
export function errorMessage(e: unknown): string {
  if (isAxiosError<ApiError>(e)) {
    if (e.response?.data?.error?.message) return e.response.data.error.message;
    if (!e.response) return 'Cannot reach RideTrack. Check your connection and try again.';
  }
  if (e instanceof Error && e.message) return e.message;
  return 'Something went wrong. Please try again.';
}

/** The API's error code (e.g. `OFF_DUTY`, `BUS_NOT_FOUND`), when there is one. Mock errors carry the same codes. */
export function errorCode(e: unknown): string | null {
  if (isAxiosError<ApiError>(e)) return e.response?.data?.error?.code ?? null;
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : null;
}
