import type { FleetVehicle, Stop, TransportMode, VehiclePosition } from '@/types';

export type LiveMapProps = {
  stops: Stop[];
  vehicles: VehiclePosition[];
  mode: TransportMode;
  selectedVehicleId: number | null;
  onSelectVehicle: (vehicleId: number) => void;
};

export type FleetMapProps = { vehicles: FleetVehicle[]; selectedId: number | null; onSelect: (vehicleId: number) => void };
