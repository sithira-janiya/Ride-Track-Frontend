import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { userApi } from '@/api/endpoints';
import { Button, Card, ErrorMessage, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල' },
  { value: 'ta', label: 'தமிழ்' },
];

export default function PassengerProfile() {
  const c = useColors();
  const user = useAuth((s) => s.user)!;
  const setUser = useAuth((s) => s.setUser);
  const logout = useAuth((s) => s.logout);

  const [name, setName] = useState(user.name);
  const [language, setLanguage] = useState(user.language ?? 'en');
  const [notifications, setNotifications] = useState(user.notificationsEnabled !== false);
  const [nameError, setNameError] = useState<string | undefined>();

  const dirty =
    name.trim() !== user.name || language !== (user.language ?? 'en') || notifications !== (user.notificationsEnabled !== false);

  const save = useMutation({
    mutationFn: () => userApi.update(user.userId, { name: name.trim(), language, notificationsEnabled: notifications }),
    onSuccess: (updated) => setUser({ ...user, ...updated }),
  });

  const submit = () => {
    if (name.trim().length < 2) {
      setNameError('Enter your name (at least 2 characters).');
      return;
    }
    setNameError(undefined);
    save.mutate();
  };

  const signOut = async () => {
    disconnectSocket();
    await logout();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Profile
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{user.email ?? user.phone}</Text>

          <TextField label="Name" value={name} onChangeText={setName} error={nameError} autoCapitalize="words" />

          <Text style={[styles.label, { color: c.text }]}>Language</Text>
          <View accessibilityRole="radiogroup" style={styles.chips}>
            {LANGUAGES.map((l) => {
              const selected = l.value === language;
              return (
                <Pressable
                  key={l.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={l.label}
                  onPress={() => setLanguage(l.value)}
                  style={[
                    styles.chip,
                    { backgroundColor: selected ? c.primary : c.background, borderColor: selected ? c.primary : c.border },
                  ]}>
                  <Text style={[styles.chipText, { color: selected ? c.onPrimary : c.text }]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Card>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={[styles.label, { color: c.text }]}>Alert notifications</Text>
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {notifications
                    ? 'On: you will be told about delays, cancellations and route changes.'
                    : 'Off: alerts still appear in the Alerts tab.'}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Alert notifications"
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: c.primary, false: c.border }}
              />
            </View>
          </Card>

          {save.isError ? <ErrorMessage message={errorMessage(save.error)} /> : null}
          {save.isSuccess && !dirty ? (
            <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
              ✓ Profile saved
            </Text>
          ) : null}
          <Button title="Save changes" loading={save.isPending} disabled={!dirty} onPress={submit} />
          <Button title="Log out" variant="secondary" onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  label: { ...typography.body, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: minTouchTarget, justifyContent: 'center', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md },
  chipText: { ...typography.body, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchText: { flex: 1, gap: spacing.xs },
});
