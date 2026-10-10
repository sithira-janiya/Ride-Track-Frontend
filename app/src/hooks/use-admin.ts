import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '@/api/endpoints';
import type { NewStaffAccount, NewVehicle, AdminVehicle, Role, TicketStatus } from '@/types';

// Admin data is never kept on the device: the `admin` key is not in the offline list in src/app/_layout.tsx.
const PAGE_SIZE = 20;

export function useAdminOverview() {
  return useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.overview, refetchInterval: 60_000 });
}

/** Accounts, newest first, filtered on the server by search text and role. */
export function useAdminUsers(q: string, role: Role | undefined) {
  return useInfiniteQuery({
    queryKey: ['admin', 'users', q, role ?? 'ALL'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => adminApi.users({ q, role, page: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (last, pages) => (pages.length * PAGE_SIZE < last.total ? pages.length + 1 : undefined),
  });
}

export function useAdminTickets(status: TicketStatus | undefined) {
  return useInfiniteQuery({
    queryKey: ['admin', 'tickets', status ?? 'ALL'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => adminApi.tickets({ status, page: pageParam, limit: PAGE_SIZE }),
    getNextPageParam: (last, pages) => (pages.length * PAGE_SIZE < last.total ? pages.length + 1 : undefined),
  });
}

export function useAdminRoutes() {
  return useQuery({ queryKey: ['admin', 'routes'], queryFn: adminApi.routes });
}

export function useAdminVehicles() {
  return useQuery({ queryKey: ['admin', 'vehicles'], queryFn: adminApi.vehicles });
}

export function useAdminTrips(date: string, routeId: number | undefined) {
  return useQuery({ queryKey: ['admin', 'trips', date, routeId ?? 'ALL'], queryFn: () => adminApi.trips(date, routeId) });
}

/** Every admin change can move the overview counts, so refresh all admin data afterwards. */
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin'] });
}

export function useCreateStaffAccount() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: (input: NewStaffAccount) => adminApi.createUser(input), onSuccess: invalidate });
}

export function useUpdateAccount() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ userId, ...input }: { userId: number; isActive?: boolean; vehicleId?: number | null }) => adminApi.updateUser(userId, input),
    onSuccess: invalidate,
  });
}

export function useCreateVehicle() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: (input: NewVehicle) => adminApi.createVehicle(input), onSuccess: invalidate });
}

export function useUpdateVehicle() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ vehicleId, ...input }: { vehicleId: number } & Partial<Pick<AdminVehicle, 'regNo' | 'capacity' | 'routeId' | 'isActive'>>) =>
      adminApi.updateVehicle(vehicleId, input),
    onSuccess: invalidate,
  });
}
