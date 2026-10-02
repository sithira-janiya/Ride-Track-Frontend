import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { colors, roleColors, type Role } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type RoleTab = {
  /** Route file name inside the role group, "index" for the first tab. */
  name: string;
  title: string;
  icon: IconName;
};

/** Bottom tab bar shared by all three roles, tinted with the role's accent colour. */
export function RoleTabs({ role, tabs }: { role: Role; tabs: RoleTab[] }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: roleColors[role],
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
