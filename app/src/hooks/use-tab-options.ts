import type { BottomTabNavigationOptions } from 'expo-router/tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from './use-colors';

/** Content height of the tab bar: room for the icon and a 14 pt label (the default 49 clips the label). */
const TAB_BAR_HEIGHT = 60;

/** Shared tab bar look for the passenger, staff and authority tabs, kept above the iPhone home indicator. */
export function useTabOptions(): BottomTabNavigationOptions {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarActiveTintColor: c.primary,
    tabBarInactiveTintColor: c.textSecondary,
    tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border, height: TAB_BAR_HEIGHT + insets.bottom },
    tabBarLabelStyle: { fontSize: 14 },
  };
}
