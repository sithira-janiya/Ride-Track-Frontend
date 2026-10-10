import type { Stop, TransportMode, VehiclePosition } from '@/types';

export type LiveMapProps = {
  stops: Stop[];
  vehicles: VehiclePosition[];
  mode: TransportMode;
  selectedVehicleId: number | null;
  onSelectVehicle: (vehicleId: number) => void;
};
