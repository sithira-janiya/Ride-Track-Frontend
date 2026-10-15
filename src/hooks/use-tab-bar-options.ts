import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, useRoleAccent } from '@/hooks/use-colors';
import type { HeroTone } from '@/theme';

// One tab bar look for every role, tinted with that role's accent so each app is recognisable at a glance.
// The height is set explicitly so the 28px emoji pill and the 14px label both fit above the home indicator.
export function useTabBarOptions(tone: HeroTone) {
  const c = useColors();
  const accent = useRoleAccent(tone);
  const { bottom } = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: c.textSecondary,
    tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border, height: 66 + bottom, paddingTop: 6, paddingBottom: bottom + 6 },
    tabBarItemStyle: { gap: 2 },
    tabBarLabelStyle: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const },
  };
}
