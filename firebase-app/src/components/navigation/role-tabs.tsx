import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { colors, type Role } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type RoleTab = {
  /** Route file name inside the role group, "index" for the first tab. */
  name: string;
  title: string;
  icon: IconName;
};

/** Dark navy bottom tab bar shared by all three roles, as in the prototype. */
export function RoleTabs({ tabs }: { role: Role; tabs: RoleTab[] }) {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.onNavy,
        tabBarInactiveTintColor: '#7F93C0',
        tabBarStyle: { backgroundColor: colors.navy, borderTopColor: colors.navy },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
