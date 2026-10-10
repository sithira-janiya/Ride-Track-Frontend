import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/theme';

export function useColors(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}
