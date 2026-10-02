import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const colors = {
  primary: '#1565C0',
  onPrimary: '#FFFFFF',
  secondary: '#F9A825',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1B2430',
  textMuted: '#5F6B7A',
  border: '#DDE3EA',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#C62828',
} as const;

// One accent colour per role so users always know which area they are in.
export const roleColors = {
  passenger: '#1565C0',
  conductor: '#2E7D32',
  authority: '#6A1B9A',
} as const;

export type Role = keyof typeof roleColors;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 12, lg: 20 } as const;

export function createTheme(accent: string = colors.primary): MD3Theme {
  return {
    ...MD3LightTheme,
    roundness: radius.md,
    colors: {
      ...MD3LightTheme.colors,
      primary: accent,
      onPrimary: colors.onPrimary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onSurfaceVariant: colors.textMuted,
      outline: colors.border,
      error: colors.error,
    },
  };
}

export const theme = createTheme();
