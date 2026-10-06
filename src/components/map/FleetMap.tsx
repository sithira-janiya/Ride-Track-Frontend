import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';
import type { FleetVehicle } from '@/types';

export type FleetMapProps = { vehicles: FleetVehicle[]; selectedId: number | null; onSelect: (vehicleId: number) => void };

/** Native fleet map: every vehicle as a labelled marker, framed to fit when the filter changes. */
export function FleetMap({ vehicles, selectedId, onSelect }: FleetMapProps) {
  const c = useColors();
  const mapRef = useRef<MapView>(null);
  const ready = useRef(false);
  // re-frame only when the set of vehicles changes, not on every position update
  const key = vehicles.map((v) => v.vehicleId).join(',');

  const fit = () => {
    if (!ready.current || vehicles.length === 0) return;
    mapRef.current?.fitToCoordinates(
      vehicles.map((v) => ({ latitude: v.lat, longitude: v.lng })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
    );
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fit, [key]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      onMapReady={() => {
        ready.current = true;
        fit();
      }}
      initialRegion={{ latitude: 6.9, longitude: 79.9, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
      accessibilityLabel="Map of all vehicles">
      {vehicles.map((v) => {
        const selected = v.vehicleId === selectedId;
        return (
          <Marker
            key={v.vehicleId}
            coordinate={{ latitude: v.lat, longitude: v.lng }}
            onPress={() => onSelect(v.vehicleId)}
            zIndex={selected ? 20 : 10}
            tracksViewChanges>
            <View style={[styles.pin, { backgroundColor: selected ? c.primary : c.background, borderColor: c.primary }]}>
              <Text style={[styles.pinText, { color: selected ? c.onPrimary : c.text }]}>
                {v.routeNo} · {v.regNo ?? v.vehicleId}
              </Text>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pin: { borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  pinText: { ...typography.caption, fontWeight: '700' },
});
