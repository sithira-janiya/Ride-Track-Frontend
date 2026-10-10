import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, IconButton, Text } from 'react-native-paper';

import { LivePill } from '@/components/trip/live-pill';
import { Screen } from '@/components/ui/screen';
import { StatusPill } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { colors, radius, spacing } from '@/constants/theme';
import { transportOptions } from '@/constants/transport';
import { useLiveTrip } from '@/hooks/use-live-trip';
import { useTripDetail } from '@/hooks/use-trip-detail';
import { toClock, toMinutes } from '@/lib/format';
import { getTripProgress } from '@/lib/trip-progress';
import { minutesAtFraction, positionAt, stopCoordinates } from '@/lib/vehicle-position';

const EDGE_PADDING = { top: 60, right: 60, bottom: 60, left: 60 };

export default function LiveTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<MapView>(null);

  const { detail, loading } = useTripDetail(id);
  const [simulate, setSimulate] = useState(false);
  const { fraction, secondsSinceUpdate, isLive } = useLiveTrip(detail, simulate);

  // Stop markers are custom views: let them draw once, then stop re-rendering them.
  const [stopsDrawn, setStopsDrawn] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setStopsDrawn(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Screen title="Live Tracking" back>
        <ActivityIndicator style={styles.loading} accessibilityLabel="Loading trip" />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen title="Live Tracking" back>
        <Text variant="titleMedium">We could not find this trip</Text>
        <Text style={styles.muted}>It may have been removed. Go back and search again.</Text>
      </Screen>
    );
  }

  const { schedule, route, vehicle, stopTimes } = detail;
  const option = transportOptions[route.type];
  const coordinates = stopCoordinates(route.stops);
  // Real GPS point while the vehicle is reporting; otherwise the spot on the route for this share of the trip.
  const gps = isLive ? vehicle.location : undefined;
  const position = gps ? { latitude: gps.lat, longitude: gps.lng } : positionAt(route.stops, fraction);

  const real = new Date();
  const nowMinutes = simulate ? minutesAtFraction(detail, fraction) : real.getHours() * 60 + real.getMinutes() + real.getSeconds() / 60;
  const progress = getTripProgress(detail, nowMinutes);

  // Part of the route already travelled, ending at the vehicle.
  const travelled = [...coordinates.filter((_, i) => route.stops[i].at <= fraction), position];
  const arrival = toClock(toMinutes(schedule.departure) + schedule.durationMinutes);

  const fitRoute = () => mapRef.current?.fitToCoordinates(coordinates, { edgePadding: EDGE_PADDING, animated: true });
  const centreOnVehicle = () =>
    mapRef.current?.animateToRegion({ ...position, latitudeDelta: 0.35, longitudeDelta: 0.35 }, 600);
  const zoom = async (delta: number) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) mapRef.current?.animateCamera({ zoom: (camera.zoom ?? 8) + delta }, { duration: 300 });
  };

  const eta =
    progress.phase === 'in-progress' && progress.etaMinutes !== undefined
      ? `${Math.max(1, Math.round(progress.etaMinutes))} min`
      : progress.phase === 'completed'
        ? 'Arrived'
        : 'Not started';

  return (
    <Screen
      title="Live Tracking"
      subtitle={`${vehicle.number} · ${route.from} → ${route.to}`}
      back
      headerRight={<LivePill />}
      scroll={false}
    >
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: (route.stops[0].lat + route.stops[route.stops.length - 1].lat) / 2,
            longitude: (route.stops[0].lng + route.stops[route.stops.length - 1].lng) / 2,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }}
          onMapReady={fitRoute}
          toolbarEnabled={false}
        >
          <Polyline coordinates={coordinates} strokeColor="#94A3B8" strokeWidth={4} />
          {travelled.length > 1 ? <Polyline coordinates={travelled} strokeColor={colors.primary} strokeWidth={5} /> : null}

          {route.stops.map((stop, index) => (
            <Marker
              key={stop.name}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.name}
              description={stopTimes[index].time}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={!stopsDrawn}
            >
              <View style={[styles.stopDot, stop.at <= fraction && styles.stopDotPassed]} />
            </Marker>
          ))}

          <Marker coordinate={position} title={vehicle.number} description={progress.summary} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.vehicle}>
              <Ionicons name={option.icon.replace('-outline', '') as 'bus' | 'train'} size={18} color="#FFFFFF" />
            </View>
          </Marker>
        </MapView>

        <View style={styles.controls}>
          <IconButton mode="contained" icon="plus" size={20} accessibilityLabel="Zoom in" onPress={() => zoom(1)} />
          <IconButton mode="contained" icon="minus" size={20} accessibilityLabel="Zoom out" onPress={() => zoom(-1)} />
          <IconButton mode="contained" icon="crosshairs-gps" size={20} accessibilityLabel="Centre on vehicle" onPress={centreOnVehicle} />
          <IconButton mode="contained" icon="map-marker-path" size={20} accessibilityLabel="Show whole route" onPress={fitRoute} />
        </View>
      </View>

      <SurfaceCard style={styles.panel}>
        <View style={styles.panelTop}>
          <Text variant="titleMedium" style={styles.bold}>
            {vehicle.number}
          </Text>
          <StatusPill status={schedule.status} />
          <View style={styles.spacer} />
          <Text variant="labelSmall" style={styles.muted}>
            Updated {secondsSinceUpdate}s ago
          </Text>
        </View>

        <View style={styles.tiles}>
          <View style={styles.tile}>
            <Text variant="labelSmall" style={styles.muted}>
              Location
            </Text>
            <Text variant="bodySmall" style={styles.tileValue} numberOfLines={3}>
              {progress.summary.replace(/\.$/, '')}
            </Text>
          </View>
          <View style={styles.tile}>
            <Text variant="labelSmall" style={styles.muted}>
              {progress.nextStopName ? `ETA ${progress.nextStopName}` : 'ETA'}
            </Text>
            <Text variant="titleSmall" style={styles.tileValue}>
              {eta}
            </Text>
          </View>
          <View style={styles.tile}>
            <Text variant="labelSmall" style={styles.muted}>
              Arrival
            </Text>
            <Text variant="titleSmall" style={styles.tileValue}>
              {arrival}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            mode={simulate ? 'contained' : 'outlined'}
            icon={simulate ? 'stop' : 'play'}
            compact
            style={styles.action}
            onPress={() => setSimulate((value) => !value)}
          >
            {simulate ? 'Stop demo' : 'Simulate trip'}
          </Button>
          <Button
            mode="outlined"
            icon="map-marker-multiple-outline"
            compact
            style={styles.action}
            onPress={() => router.push({ pathname: '/(passenger)/route/[id]', params: { id: schedule.id } })}
          >
            Route & Stops
          </Button>
        </View>
        <Text variant="labelSmall" style={styles.muted}>
          {simulate
            ? 'Demo: the vehicle drives the whole trip in about 90 seconds.'
            : isLive
              ? 'Live GPS position reported by the vehicle.'
              : 'No recent GPS from this vehicle, so the position follows the timetable and your phone clock.'}
        </Text>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xl },
  mapWrap: { flex: 1, minHeight: 280, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  controls: { position: 'absolute', right: spacing.xs, top: spacing.xs },
  stopDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: '#94A3B8',
  },
  stopDotPassed: { borderColor: colors.primary },
  vehicle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: { gap: spacing.sm },
  panelTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spacer: { flex: 1 },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: { flex: 1, gap: 2, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.sm },
  tileValue: { fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
  bold: { fontWeight: '700' },
  muted: { color: colors.textMuted },
});
