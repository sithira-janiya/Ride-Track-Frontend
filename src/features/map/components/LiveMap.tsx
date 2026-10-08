import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing, typography } from '@/theme';

import type { LiveMapProps } from '../types';

/** Native map: route line, stops and live vehicle markers (FR4). The web build uses LiveMap.web.tsx. */
export function LiveMap({ stops, vehicles, mode, selectedVehicleId, onSelectVehicle }: LiveMapProps) {
  const c = useColors();
  const mapRef = useRef<MapView>(null);
  const line = stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));

  // frame the whole route once the map is ready
  const fit = () =>
    mapRef.current?.fitToCoordinates(line, { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: false });

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      onMapReady={fit}
      initialRegion={
        line[0] ? { latitude: line[0].latitude, longitude: line[0].longitude, latitudeDelta: 0.15, longitudeDelta: 0.15 } : undefined
      }
      accessibilityLabel="Live map of the route">
      <Polyline coordinates={line} strokeColor={c.primary} strokeWidth={4} />
      {stops.map((s) => (
        <Marker key={`stop-${s.stopId}`} coordinate={{ latitude: s.latitude, longitude: s.longitude }} title={s.name} pinColor={c.primaryDark} />
      ))}
      {vehicles.map((v) => {
        const selected = v.vehicleId === selectedVehicleId;
        return (
          <Marker
            key={`vehicle-${v.vehicleId}`}
            coordinate={{ latitude: v.lat, longitude: v.lng }}
            onPress={() => onSelectVehicle(v.vehicleId)}
            zIndex={10}
            tracksViewChanges>
            <View style={[styles.vehicle, { backgroundColor: selected ? c.primary : c.background, borderColor: c.primary }]}>
              <Text style={[styles.vehicleText, { color: selected ? c.onPrimary : c.text }]}>
                {mode === 'TRAIN' ? 'Train' : 'Bus'} {v.regNo ?? v.vehicleId}
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
  vehicle: { borderWidth: 2, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  vehicleText: { ...typography.caption, fontWeight: '700' },
});
