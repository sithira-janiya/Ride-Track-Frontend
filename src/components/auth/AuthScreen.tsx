import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userApi } from '@/api/endpoints';
import { LanguagePicker } from '@/components/ui';
import { illustrations } from '@/components/ui/illustrations';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { spacing, typography } from '@/theme';
import type { AuthResult } from '@/types';

type Props = { title: string; subtitle: string; children: ReactNode };

/** Shared shell for the login and register screens. */
export function AuthScreen({ title, subtitle, children }: Props) {
  const c = useColors();
  const t = useT();
  const language = useLanguage((s) => s.language);
  const setLanguage = useLanguage((s) => s.pickBeforeLogin);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Image source={illustrations.authHero} style={styles.hero} contentFit="contain" accessibilityLabel="" />
            <Text accessibilityRole="header" style={[styles.brand, { color: c.primary }]}>
              RideTrack
            </Text>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {t(title)}
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>{t(subtitle)}</Text>
            <View style={styles.form}>{children}</View>
            <LanguagePicker value={language} onChange={setLanguage} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Starts the session from a login/register result. A language picked on the auth screen (or any device language, for a
 * new account) is kept and saved to the account; otherwise the root layout switches the UI to the account's language.
 */
export async function startSession(r: AuthResult, { newAccount = false } = {}) {
  const { language, pickedBeforeLogin, clearPickBeforeLogin } = useLanguage.getState();
  clearPickBeforeLogin();
  const { setSession, setUser } = useAuth.getState();
  if (!(pickedBeforeLogin || newAccount) || r.user.language === language) return setSession(r);

  await setSession({ ...r, user: { ...r.user, language } });
  try {
    const updated = await userApi.update(r.user.userId, { language });
    const current = useAuth.getState().user;
    if (current?.userId === r.user.userId) await setUser({ ...current, ...updated, language });
  } catch (e) {
    // the UI stays in the picked language; the account keeps its old one until it is changed on the Profile screen
    if (__DEV__) console.warn('[i18n] could not save language to the account', e);
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: spacing.sm },
  hero: { width: '100%', height: 140, marginBottom: spacing.sm },
  brand: { ...typography.title },
  title: { ...typography.heading },
  subtitle: { ...typography.body, marginBottom: spacing.sm },
  form: { gap: spacing.md, marginBottom: spacing.md },
});
