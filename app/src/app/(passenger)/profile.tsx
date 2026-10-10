import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { userApi } from '@/api/endpoints';
import { Button, Card, ErrorMessage, LanguagePicker, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { disconnectSocket } from '@/socket';
import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { spacing, typography } from '@/theme';

export default function PassengerProfile() {
  const c = useColors();
  const t = useT();
  const user = useAuth((s) => s.user)!;
  const setUser = useAuth((s) => s.setUser);
  const logout = useAuth((s) => s.logout);

  const [name, setName] = useState(user.name);
  const currentLanguage = useLanguage((s) => s.language);
  const savedLanguage = user.language ?? currentLanguage;
  const [language, setLanguage] = useState(savedLanguage);
  const [notifications, setNotifications] = useState(user.notificationsEnabled !== false);
  const [nameError, setNameError] = useState<string | undefined>();

  const dirty =
    name.trim() !== user.name || language !== savedLanguage || notifications !== (user.notificationsEnabled !== false);

  const save = useMutation({
    mutationFn: () => userApi.update(user.userId, { name: name.trim(), language, notificationsEnabled: notifications }),
    // the root layout switches the UI language when the saved user's language changes
    onSuccess: (updated) => setUser({ ...user, ...updated, language }),
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
            {t('Profile')}
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{user.email ?? user.phone}</Text>

          <TextField label="Name" value={name} onChangeText={setName} error={nameError} autoCapitalize="words" />

          <LanguagePicker value={language} onChange={setLanguage} />

          <Card>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text style={[styles.label, { color: c.text }]}>{t('Alert notifications')}</Text>
                <Text style={[styles.caption, { color: c.textSecondary }]}>
                  {t(
                    notifications
                      ? 'On: you will be told about delays, cancellations and route changes.'
                      : 'Off: alerts still appear in the Alerts tab.',
                  )}
                </Text>
              </View>
              <Switch
                accessibilityLabel={t('Alert notifications')}
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ true: c.primary, false: c.border }}
              />
            </View>
          </Card>

          {save.isError ? <ErrorMessage message={errorMessage(save.error)} /> : null}
          {save.isSuccess && !dirty ? (
            <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
              ✓ {t('Profile saved')}
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
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchText: { flex: 1, gap: spacing.xs },
});
