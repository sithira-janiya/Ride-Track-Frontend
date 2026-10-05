import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, StatusBadge } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { spacing, typography } from '@/theme';

type Props = { heading: string; note: string; showLogout?: boolean };

/** Temporary landing screen per role, replaced as later phases land. */
export function RoleHome({ heading, note, showLogout = true }: Props) {
  const c = useColors();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const signOut = async () => {
    disconnectSocket();
    await logout(); // root route guard returns to the login screen
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
          {heading}
        </Text>
        <Card>
          <Text style={[styles.name, { color: c.text }]}>{user?.name}</Text>
          <Text style={[styles.meta, { color: c.textSecondary }]}>{user?.email ?? user?.phone}</Text>
          <StatusBadge label={user?.role ?? ''} tone="info" />
        </Card>
        <Text style={[styles.meta, { color: c.textSecondary }]}>{note}</Text>
        {showLogout ? <Button title="Log out" variant="secondary" onPress={signOut} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 560, alignSelf: 'center' },
  heading: { ...typography.heading },
  name: { ...typography.bodyLarge, fontWeight: '700' },
  meta: { ...typography.body },
});
