import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, useColorScheme } from 'react-native';

import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

import { BOOT_SCENE_MAX_WIDTH, BOOT_THEME } from './boot-theme';
import { LoadingScene } from './LoadingScene';
import { BOOT_HTML_ID } from './scene';

type Props = {
  /** true once the app is ready: the loader fades out, then calls `onGone`. */
  leaving: boolean;
  /** Called once the loader is on screen; the native splash can hide now. */
  onShown: () => void;
  onGone: () => void;
};

/** Full-screen loader while the app starts: the brand, the street scene and a short line of text. */
export function BootLoader({ leaving, onShown, onGone }: Props) {
  const theme = BOOT_THEME[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const t = useT();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!leaving) return;
    const fade = Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: Platform.OS !== 'web' });
    fade.start(({ finished }) => {
      if (finished) onGone();
    });
    return () => fade.stop();
  }, [leaving, opacity, onGone]);

  const shown = () => {
    // the web boot screen from +html.tsx covered the page while the bundle downloaded; this loader takes over now
    if (Platform.OS === 'web') globalThis.document?.getElementById(BOOT_HTML_ID)?.remove();
    onShown();
  };

  return (
    <Animated.View
      onLayout={shown}
      accessibilityRole="progressbar"
      accessibilityLabel={t('Loading RideTrack')}
      style={[StyleSheet.absoluteFill, styles.wrap, { backgroundColor: theme.background, opacity, pointerEvents: leaving ? 'none' : 'auto' }]}>
      <Text style={[styles.brand, { color: theme.brand }]}>RideTrack</Text>
      <LoadingScene height={200} style={[styles.scene, { borderColor: theme.frame }]} />
      <Text style={[styles.label, { color: theme.label }]}>{t('Getting your journey ready…')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 10, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.md },
  brand: { ...typography.heading },
  scene: { width: '100%', maxWidth: BOOT_SCENE_MAX_WIDTH, borderRadius: 24, borderWidth: 2 },
  label: { ...typography.body, textAlign: 'center' },
});
