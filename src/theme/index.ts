// RideTrack design tokens. Accessibility targets from NFR8: body text >= 16, high contrast,
// touch targets >= 44, status shown by icon AND text.
import { Platform } from 'react-native';

export type ThemeColors = Record<
  | 'primary' | 'primaryDark' | 'success' | 'successBg' | 'danger' | 'dangerBg' | 'warning' | 'warningBg'
  | 'info' | 'infoBg' | 'background' | 'surface' | 'border' | 'text' | 'textSecondary' | 'onPrimary',
  string
>;

export const palette = {
  primary: '#0B5FFF',
  primaryDark: '#0847BF',
  success: '#0A7D3B',
  successBg: '#E3F6EA',
  danger: '#C62828',
  dangerBg: '#FDE7E7',
  warning: '#8A5A00',
  warningBg: '#FFF1D6',
  info: '#0B5FFF',
  infoBg: '#E6EEFF',
} as const;

export const lightColors: ThemeColors = {
  ...palette,
  background: '#FFFFFF',
  surface: '#F4F6FA',
  border: '#D5DAE3',
  text: '#10151F',
  textSecondary: '#4A5365',
  onPrimary: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  ...palette,
  primary: '#6B9BFF',
  primaryDark: '#9DBBFF',
  success: '#5FD18A',
  successBg: '#10301E',
  danger: '#FF8A80',
  dangerBg: '#3A1616',
  warning: '#FFC857',
  warningBg: '#38290A',
  info: '#6B9BFF',
  infoBg: '#12234A',
  background: '#0B0E14',
  surface: '#161B26',
  border: '#2B3345',
  text: '#F2F5FA',
  textSecondary: '#A9B3C6',
  onPrimary: '#0B0E14',
};



export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const minTouchTarget = 44;

export const typography = {
  body: { fontSize: 16, lineHeight: 24 },
  bodyLarge: { fontSize: 18, lineHeight: 26 },
  caption: { fontSize: 14, lineHeight: 20 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  fontFamily: Platform.select({ web: 'system-ui, sans-serif', default: undefined }),
};
