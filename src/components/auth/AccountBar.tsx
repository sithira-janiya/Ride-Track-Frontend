import { StyleSheet, Text, View } from 'react-native';

import { useColors, useRoleAccent } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { spacing, typography, type HeroTone } from '@/theme';
import type { Role } from '@/types';

import { LogoutButton } from './LogoutButton';

const ROLE_LABEL: Record<Role, string> = { PASSENGER: 'Passenger', STAFF: 'Staff', AUTHORITY: 'Authority officer' };
const ROLE_TONE: Record<Role, HeroTone> = { PASSENGER: 'passenger', STAFF: 'staff', AUTHORITY: 'authority' };

type Props = {
  /** Colour of the initial; defaults to the signed-in role's accent. */
  tone?: HeroTone;
};

/** Who is signed in, and a "Log out" button. Sits at the top of every role's home screen. */
export function AccountBar({ tone }: Props) {
  const c = useColors();
  const t = useT();
  const user = useAuth((s) => s.user);
  const accent = useRoleAccent(tone ?? ROLE_TONE[user?.role ?? 'PASSENGER']);
  if (!user) return null;
  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={styles.row}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.avatar, { backgroundColor: `${accent}24` }]}>
        <Text maxFontSizeMultiplier={1.2} style={[styles.initial, { color: accent }]}>
          {initial}
        </Text>
      </View>
      <View accessible accessibilityLabel={t('Logged in as {name}, {role}', { name: user.name, role: t(ROLE_LABEL[user.role]) })} style={styles.who}>
        <Text numberOfLines={1} style={[styles.name, { color: c.text }]}>
          {user.name}
        </Text>
        <Text numberOfLines={1} style={[styles.role, { color: c.textSecondary }]}>
          {t(ROLE_LABEL[user.role])} · {user.email ?? user.phone}
        </Text>
      </View>
      <LogoutButton compact />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 20, lineHeight: 24, fontWeight: '700' },
  who: { flex: 1, minWidth: 0 },
  name: { ...typography.body, fontWeight: '700' },
  role: { ...typography.caption },
});
