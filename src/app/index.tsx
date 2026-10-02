import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Screen } from '@/components/ui/screen';
import { colors, roleColors, spacing } from '@/constants/theme';

// Temporary entry point. Replaced by real sign-in, which will route by the user's role.
const roles = [
  { label: 'Passenger', href: '/(passenger)/(tabs)', color: roleColors.passenger },
  { label: 'Conductor', href: '/(conductor)', color: roleColors.conductor },
  { label: 'Authority', href: '/(authority)', color: roleColors.authority },
] as const;

export default function Index() {
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  brand: { color: colors.primary, fontWeight: '800', textAlign: 'center' },
  tagline: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  buttons: { gap: spacing.md },
  buttonContent: { paddingVertical: spacing.sm },
});
