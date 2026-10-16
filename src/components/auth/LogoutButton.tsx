import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useLogout } from '@/hooks/use-logout';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

type Props = {
  /** Small pill for the account bar; otherwise a full-width secondary button. */
  compact?: boolean;
};

/** "Log out" for every role: asks first, then signs out (see useLogout). */
export function LogoutButton({ compact }: Props) {
  const { logOut, busy } = useLogout();
  const c = useColors();
  const t = useT();
  if (!compact) return <Button title="Log out" variant="secondary" loading={busy} onPress={logOut} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Log out')}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={logOut}
      hitSlop={4}
      style={({ pressed }) => [styles.pill, { borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 }]}>
      {busy ? (
        <ActivityIndicator color={c.text} />
      ) : (
        <Text maxFontSizeMultiplier={1.3} style={[styles.text, { color: c.text }]}>
          {t('Log out')}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: minTouchTarget,
    minWidth: 96,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.body, fontWeight: '600' },
});
