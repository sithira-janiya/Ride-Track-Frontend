import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';

import { useColors } from '@/hooks/use-colors';

/** The tab bar look shared by the passenger, staff and authority tabs. */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  const c = useColors();
  return {
    headerShown: false,
    tabBarActiveTintColor: c.primary,
    tabBarInactiveTintColor: c.textSecondary,
    tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
    tabBarLabelStyle: { fontSize: 14 },
  };
}
