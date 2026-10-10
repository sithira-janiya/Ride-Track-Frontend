import type { LiveMapProps } from './types';
import { WebMap, type WebMapPoint } from './WebMap';

/** Web map (react-native-maps is native only): route line, stops and live vehicles on OpenStreetMap. */
export function LiveMap({ stops, vehicles, mode, selectedVehicleId, onSelectVehicle }: LiveMapProps) {
  const points: WebMapPoint[] = [
    ...stops.map((s) => ({ key: `stop-${s.stopId}`, lat: s.latitude, lng: s.longitude, label: s.name, kind: 'stop' as const })),
    ...vehicles.map((v) => ({
      key: `vehicle-${v.vehicleId}`,
      lat: v.lat,
      lng: v.lng,
      label: `${mode === 'TRAIN' ? 'Train' : 'Bus'} ${v.regNo ?? v.vehicleId}`,
      kind: 'vehicle' as const,
      selected: v.vehicleId === selectedVehicleId,
      onPress: () => onSelectVehicle(v.vehicleId),
    })),
  ];
  return (
    <WebMap
      points={points}
      line={stops.map((s) => ({ lat: s.latitude, lng: s.longitude }))}
      // frame the route once; vehicles moving along it do not re-frame the map
      fitKey={stops.map((s) => s.stopId).join(',')}
      accessibilityLabel="Live map of the route"
    />
  );
}
