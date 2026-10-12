import { useColors } from '@/hooks/use-colors';

// One tab bar look for every role (passenger, staff, authority), so the bottom bar never drifts between them.
export function useTabBarOptions() {
  const c = useColors();
  return {
    headerShown: false,
    tabBarActiveTintColor: c.primary,
    tabBarInactiveTintColor: c.textSecondary,
    tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border },
    tabBarLabelStyle: { fontSize: 14 },
  };
}
