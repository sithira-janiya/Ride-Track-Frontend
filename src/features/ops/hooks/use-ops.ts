import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { opsApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';
import { env } from '@/config/env';
import { getSocket } from '@/lib/socket';
import type { ReportType } from '@/types';

/**
 * Live operations snapshot (FR9). The socket's `ops:update` tells us when to refresh;
 * a slow poll covers a dropped connection, and mock mode (no socket) polls quickly instead.
 */
export function useOpsDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.opsDashboard,
    queryFn: opsApi.dashboard,
    refetchInterval: env.useMockApi ? 4_000 : 30_000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.opsDashboard });
    socket.on('ops:update', refresh);
    return () => {
      socket.off('ops:update', refresh);
    };
  }, [queryClient]);

  return query;
}

export type ReportCriteria = { type: ReportType; routeId: number | undefined; days: number };

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** The report for the last `days` days, up to today. Nothing is fetched until criteria are given. */
export function useReport(criteria: ReportCriteria | null) {
  return useQuery({
    queryKey: queryKeys.report(criteria),
    queryFn: () => {
      const to = new Date();
      const from = new Date(to.getTime() - (criteria!.days - 1) * 86400000);
      return opsApi.report(criteria!.type, criteria!.routeId, isoDay(from), isoDay(to));
    },
    enabled: criteria != null,
  });
}
