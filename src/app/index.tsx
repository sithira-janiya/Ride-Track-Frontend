import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import type { Role } from '@/constants/theme';
import { colors, radius, roleColors, spacing } from '@/constants/theme';
import { canUseTestSignIn, signInAsTestUser } from '@/lib/dev-auth';
import { isBackendConfigured, isUsingEmulator } from '@/lib/firebase';

// Temporary entry point. Replaced by real sign-in, which will route by the user's role.
const roles: { role: Role; label: string; href: '/(passenger)/(tabs)' | '/(conductor)' | '/(authority)' }[] = [
  { role: 'passenger', label: 'Passenger', href: '/(passenger)/(tabs)' },
  { role: 'conductor', label: 'Conductor', href: '/(conductor)' },
  { role: 'authority', label: 'Authority', href: '/(authority)' },
];

export default function Index() {
  const router = useRouter();
  const [busy, setBusy] = useState<Role | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const open = async (role: Role, href: (typeof roles)[number]['href']) => {
    setNote(null);
    if (canUseTestSignIn) {
      setBusy(role);
      const problem = await signInAsTestUser(role);
      setBusy(null);
      if (problem) setNote(`Test sign-in failed (${problem}). Showing sample data.`);
    }
    router.push(href);
  };

  const backend = isBackendConfigured
    ? isUsingEmulator
      ? 'local emulator'
      : 'connected to Firebase'
    : 'not configured (using sample data)';

  return (
    <Screen landing>
      <View style={styles.center}>
        <View style={styles.logo}>
          <Ionicons name="location" size={34} color={colors.onNavy} />
        </View>
        <Text variant="displaySmall" style={styles.brand}>
          RideTrack
        </Text>
        <Text variant="bodyLarge" style={styles.tagline}>
          Live bus and train tracking with QR tickets
        </Text>
        <View style={styles.buttons}>
          {roles.map(({ role, label, href }) => (
            <Button
              key={role}
              mode="contained"
              buttonColor={roleColors[role]}
              contentStyle={styles.buttonContent}
              loading={busy === role}
              disabled={busy !== null}
              onPress={() => open(role, href)}
            >
              Continue as {label}
            </Button>
          ))}
        </View>
        <Text variant="bodySmall" style={styles.status}>
          Backend: {backend}
          {isBackendConfigured ? (canUseTestSignIn ? ' · test sign-in on' : ' · test sign-in off') : ''}
        </Text>
        {note ? (
          <Text variant="bodySmall" style={styles.note}>
            {note}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  logo: {
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  brand: { color: colors.onNavy, fontWeight: '800', textAlign: 'center' },
  tagline: { color: colors.onNavyMuted, textAlign: 'center', marginBottom: spacing.lg },
  buttons: { gap: spacing.md },
  buttonContent: { paddingVertical: spacing.sm },
  status: { color: colors.onNavyMuted, textAlign: 'center', marginTop: spacing.lg },
  note: { color: '#FCD34D', textAlign: 'center' },
});
