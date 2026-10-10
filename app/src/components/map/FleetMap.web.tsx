import type { FleetMapProps } from './FleetMap';
import { WebMap } from './WebMap';

/** Web fleet map (react-native-maps is native only): every vehicle as a labelled marker on OpenStreetMap. */
export function FleetMap({ vehicles, selectedId, onSelect }: FleetMapProps) {
  return (
    <WebMap
      points={vehicles.map((v) => ({
        key: String(v.vehicleId),
        lat: v.lat,
        lng: v.lng,
        label: `${v.routeNo} · ${v.regNo ?? v.vehicleId}`,
        kind: 'vehicle',
        selected: v.vehicleId === selectedId,
        onPress: () => onSelect(v.vehicleId),
      }))}
      // re-frame when the filter changes the set of vehicles, not on every position update
      fitKey={vehicles.map((v) => v.vehicleId).join(',')}
      accessibilityLabel="Map of all vehicles"
    />
  );
}
