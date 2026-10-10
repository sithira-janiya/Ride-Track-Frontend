import 'leaflet/dist/leaflet.css';

import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

export type WebMapPoint = {
  key: string;
  lat: number;
  lng: number;
  label: string;
  kind: 'stop' | 'vehicle';
  selected?: boolean;
  onPress?: () => void;
};

type Props = {
  points: WebMapPoint[];
  /** route line drawn under the points */
  line?: { lat: number; lng: number }[];
  /** the map re-frames to fit everything when this changes, not on every position update */
  fitKey: string;
  accessibilityLabel: string;
};

type Leaflet = typeof import('leaflet');

/** Room around the framed points: vehicle labels are centred on their point and about 120 px wide. */
const FIT_PADDING: [number, number] = [70, 40];

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Street map for the web build (react-native-maps is native only): OpenStreetMap tiles drawn by Leaflet 1.9, which
 * runs in old phone browsers too. Leaflet needs `window`, so it is loaded after mount, never during static rendering.
 */
export function WebMap({ points, line = [], fitKey, accessibilityLabel }: Props) {
  const c = useColors();
  const container = useRef<View>(null);
  const [leaflet, setLeaflet] = useState<{ L: Leaflet; map: LeafletMap; layer: LayerGroup } | null>(null);
  // what to frame, kept current (by the drawing effect) for the resize handler
  const framed = useRef<[number, number][]>([]);

  // create the map once
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    // keep re-framing as the box settles (layout, rotation) until the person moves the map themselves
    let userMoved = false;
    let fitting = false;
    const fit = (L: Leaflet) => {
      const all = framed.current;
      if (!map || all.length === 0) return;
      fitting = true;
      if (all.length === 1) map.setView(all[0], 15, { animate: false });
      else map.fitBounds(L.latLngBounds(all), { padding: FIT_PADDING, animate: false });
      fitting = false;
    };
    let onResize = () => {};
    import('leaflet').then((mod) => {
      const L = ((mod as unknown as { default?: Leaflet }).default ?? mod) as Leaflet;
      const el = container.current as unknown as HTMLElement | null;
      if (cancelled || !el) return;
      map = L.map(el, { center: [6.9271, 79.8612], zoom: 12, zoomControl: true, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      map.on('movestart zoomstart', () => {
        if (!fitting) userMoved = true;
      });
      onResize = () => {
        map?.invalidateSize({ animate: false });
        if (!userMoved) fit(L);
      };
      // the container's size settles after layout (and changes on rotation)
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(onResize);
        observer.observe(el);
      } else window.addEventListener('resize', onResize);
      setTimeout(onResize, 0);
      setLeaflet({ L, map, layer: L.layerGroup().addTo(map) });
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
      map?.remove();
    };
  }, []);

  // draw the line, stops and vehicles
  useEffect(() => {
    framed.current = [...line, ...points].map((p) => [p.lat, p.lng]);
    if (!leaflet) return;
    const { L, layer } = leaflet;
    layer.clearLayers();
    if (line.length > 1) L.polyline(line.map((p) => [p.lat, p.lng] as [number, number]), { color: c.primary, weight: 4 }).addTo(layer);
    for (const p of points) {
      if (p.kind === 'stop') {
        L.circleMarker([p.lat, p.lng], { radius: 6, color: c.primaryDark, weight: 2, fillColor: '#FFFFFF', fillOpacity: 1 })
          .bindTooltip(esc(p.label))
          .addTo(layer);
        continue;
      }
      const bg = p.selected ? c.primary : '#FFFFFF';
      const fg = p.selected ? '#FFFFFF' : '#10151F';
      const icon = L.divIcon({
        className: '',
        iconSize: [0, 0], // the label sizes itself and is centred on the point by the transform
        html: `<div style="transform:translate(-50%,-50%);display:inline-block;white-space:nowrap;padding:4px 8px;border-radius:999px;border:2px solid ${c.primary};background:${bg};color:${fg};font:700 14px/20px system-ui,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.3)">${esc(p.label)}</div>`,
      });
      const marker = L.marker([p.lat, p.lng], { icon, zIndexOffset: p.selected ? 1000 : 500, title: p.label, keyboard: true }).addTo(layer);
      if (p.onPress) marker.on('click', p.onPress);
    }
  }, [leaflet, points, line, c]);

  // frame everything again when the set of points changes (e.g. a new route filter)
  useEffect(() => {
    if (!leaflet) return;
    const all = framed.current;
    leaflet.map.invalidateSize({ animate: false });
    if (all.length === 1) leaflet.map.setView(all[0], 15);
    else if (all.length > 1) leaflet.map.fitBounds(leaflet.L.latLngBounds(all), { padding: FIT_PADDING });
  }, [leaflet, fitKey]);

  return <View ref={container} accessibilityLabel={accessibilityLabel} style={[styles.map, { backgroundColor: c.surface }]} />;
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 220, overflow: 'hidden' },
});
