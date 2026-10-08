import * as Brightness from 'expo-brightness';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Max screen brightness while the QR is on screen so a scanner can read it, restored on leave. */
export function useBrightnessBoost(active: boolean) {
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;
    let previous: number | null = null;
    (async () => {
      try {
        previous = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      } catch {
        // brightness is a nicety; the QR still works without it
      }
    })();
    return () => {
      if (previous != null) Brightness.setBrightnessAsync(previous).catch(() => {});
    };
  }, [active]);
}
