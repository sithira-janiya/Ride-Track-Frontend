import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { colors, radius, roleColors, spacing } from '@/constants/theme';
import { isBackendConfigured, isUsingEmulator } from '@/lib/firebase';

// Temporary entry point. Replaced by real sign-in, which will route by the user's role.
const roles = [
  { label: 'Passenger', href: '/(passenger)/(tabs)', color: roleColors.passenger },
  { label: 'Conductor', href: '/(conductor)', color: roleColors.conductor },
  { label: 'Authority', href: '/(authority)', color: roleColors.authority },
] as const;

export default function Index() {
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
          {roles.map((role) => (
            <Link key={role.label} href={role.href} asChild>
              <Button mode="contained" buttonColor={role.color} contentStyle={styles.buttonContent}>
                Continue as {role.label}
              </Button>
            </Link>
          ))}
        </View>
        <Text variant="bodySmall" style={styles.status}>
          Backend:{' '}
          {isBackendConfigured ? (isUsingEmulator ? 'local emulator' : 'connected to Firebase') : 'not configured (using sample data)'}
        </Text>
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
});
