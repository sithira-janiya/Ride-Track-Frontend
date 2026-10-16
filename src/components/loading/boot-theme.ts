import { darkColors, heroColors } from '@/theme';

/**
 * Colours of the start-up loader, shared by the app (BootLoader) and the web boot screen (BootScreenHtml). The
 * background is the native splash's (app.json), so splash → loader → app reads as one sequence.
 */
export const BOOT_THEME = {
  light: { background: heroColors.passenger.light, brand: '#FFFFFF', label: '#FFFFFF', frame: 'rgba(255,255,255,0.3)' },
  dark: { background: darkColors.background, brand: darkColors.primary, label: darkColors.textSecondary, frame: darkColors.border },
} as const;

/** Widest the start-up scene gets. */
export const BOOT_SCENE_MAX_WIDTH = 440;
