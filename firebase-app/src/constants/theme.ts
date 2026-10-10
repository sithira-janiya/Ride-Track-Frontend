import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

/**
 * Design tokens taken from the Milestone 2 high-fidelity prototype: dark navy headers,
 * bright blue actions, white rounded cards and green or amber status pills.
 * If the Figma file changes, change the values here; screens follow automatically.
 */
export const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  onPrimary: '#FFFFFF',
  navy: '#0F2040',
  onNavy: '#FFFFFF',
  onNavyMuted: '#93B4F8',
  secondary: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF6FF',
  text: '#0F2040',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#B45309',
  warningBg: '#FEF3C7',
  error: '#DC2626',
} as const;

// One accent colour per role so users always know which area they are in.
export const roleColors = {
  passenger: '#2563EB',
  conductor: '#4F46E5',
  authority: '#0F766E',
} as const;

export type Role = keyof typeof roleColors;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export function createTheme(accent: string = colors.primary): MD3Theme {
  return {
    ...MD3LightTheme,
    roundness: radius.md,
    colors: {
      ...MD3LightTheme.colors,
      primary: accent,
      onPrimary: colors.onPrimary,
      secondary: colors.secondary,
      secondaryContainer: colors.surfaceAlt,
      onSecondaryContainer: colors.primaryDark,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onSurfaceVariant: colors.textMuted,
      outline: colors.border,
      outlineVariant: colors.border,
      error: colors.error,
    },
  };
}

export const theme = createTheme();
