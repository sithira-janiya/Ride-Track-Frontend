import { useColorScheme } from 'react-native';

import { cardShadow, darkColors, lightColors, roleAccent, type HeroTone, type ThemeColors } from '@/theme';

export function useColors(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

/** The role's accent colour for the current scheme (theme `roleAccent`). */
export function useRoleAccent(tone: HeroTone): string {
  return roleAccent[tone][useColorScheme() === 'dark' ? 'dark' : 'light'];
}

/** Fill, border and (light mode only) shadow shared by every card-like surface. */
export function useCardSurface() {
  const c = useColors();
  const dark = useColorScheme() === 'dark';
  return { backgroundColor: c.surface, borderColor: c.border, ...(dark ? null : { boxShadow: cardShadow }) };
}
