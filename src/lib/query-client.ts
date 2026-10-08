import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';

import { OFFLINE_QUERY_ROOTS } from '@/api/query-keys';

const DAY = 24 * 60 * 60 * 1000;

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, gcTime: DAY } } });
}

/** Saves the offline query roots (routes and timetables) to AsyncStorage for a day. */
export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: createAsyncStoragePersister({ storage: AsyncStorage, key: 'ridetrack.query-cache' }),
  maxAge: DAY,
  dehydrateOptions: {
    shouldDehydrateQuery: (q) => q.state.status === 'success' && OFFLINE_QUERY_ROOTS.includes(String(q.queryKey[0])),
  },
};
