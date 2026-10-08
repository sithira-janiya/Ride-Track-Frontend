import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { routesApi, vehiclesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

import { useShift } from '../stores/shift';

/** The shift's vehicle as its route reports it, and saving its on-board passenger count (FR7, `POST /vehicles/:id/occupancy`). */
export function useShiftVehicle() {
  const queryClient = useQueryClient();
  const shift = useShift((s) => s.shift);

  const vehicles = useQuery({
    queryKey: queryKeys.vehicles(shift?.routeId),
    queryFn: () => routesApi.vehicles(shift!.routeId),
    enabled: !!shift,
  });

  const saveCount = useMutation({
    mutationFn: (count: number) => vehiclesApi.setOccupancy(shift!.vehicleId, count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vehicles(shift?.routeId) }),
  });

  return { shift, vehicles, vehicle: vehicles.data?.find((v) => v.vehicleId === shift?.vehicleId), saveCount };
}
