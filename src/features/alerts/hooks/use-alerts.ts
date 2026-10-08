import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { alertsApi } from '@/api/endpoints';
import { mockApi } from '@/api/mock';
import { queryKeys } from '@/api/query-keys';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/store/auth';
import type { DelayAlert } from '@/types';

import { useAlertBanner } from '../stores/alert-banner';

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: () => alertsApi.list(), refetchInterval: 60_000 });
}

export function useUnreadCount() {
  const { data } = useAlerts();
  return data?.filter((a) => !a.isRead).length ?? 0;
}

/** Marks an alert read, updating the list straight away so the unread count drops without waiting. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.markRead(id),
    onMutate: (id) => {
      queryClient.setQueryData<DelayAlert[]>(queryKeys.alerts, (old) => old?.map((a) => (a.alertId === id ? { ...a, isRead: true } : a)));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
  });
}

/** Shows a banner and refreshes the list when the server pushes `alert:new` (real mode only). */
export function useAlertSocket() {
  const queryClient = useQueryClient();
  const enabled = useAuth((s) => s.user?.notificationsEnabled !== false);
  const show = useAlertBanner((s) => s.show);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !enabled) return;
    const onAlert = (p: { message: string }) => {
      show(p.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    };
    socket.on('alert:new', onAlert);
    return () => {
      socket.off('alert:new', onAlert);
    };
  }, [enabled, queryClient, show]);
}

/** Mock mode has no server to push `alert:new`, so this stands in for it: a new alert, its banner and a refreshed list. */
export function useSimulateAlert() {
  const queryClient = useQueryClient();
  const show = useAlertBanner((s) => s.show);
  return () => {
    show(mockApi.createDemoAlert().message);
    queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
  };
}
