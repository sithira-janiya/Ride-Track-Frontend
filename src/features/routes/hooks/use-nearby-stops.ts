import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { routesApi } from '@/api/endpoints';
import { queryKeys } from '@/api/query-keys';

type Permission = 'checking' | 'granted' | 'denied';

/** Location permission flow + nearby stops query (FR3). */
export function useNearbyStops() {
  const [permission, setPermission] = useState<Permission>('checking');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);

  const locate = useCallback(async () => {
    setLocationError(false);
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setLocationError(true); // GPS off or timed out
    }
  }, []);

  const request = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setPermission('granted');
      await locate();
    } else {
      setPermission('denied');
    }
  }, [locate]);

  // Do not prompt on launch: only use the location if permission was already granted. The user opts in with a button.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (cancelled) return;
      if (status === 'granted') {
        setPermission('granted');
        await locate();
      } else {
        setPermission('denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locate]);

  const stops = useQuery({
    queryKey: queryKeys.nearbyStops(coords?.lat.toFixed(3), coords?.lng.toFixed(3)),
    queryFn: () => routesApi.nearbyStops(coords!.lat, coords!.lng),
    enabled: coords != null,
  });

  return { permission, request, retryLocate: locate, locationError, stops };
}
