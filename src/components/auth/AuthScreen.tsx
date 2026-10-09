import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { userApi } from '@/api/endpoints';
import { Emoji, LanguagePicker } from '@/components/ui';
import { illustrations } from '@/components/ui/illustrations';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAuth } from '@/store/auth';
import { useLanguage } from '@/store/language';
import { spacing, typography } from '@/theme';
import type { AuthResult } from '@/types';

type Props = { title: string; subtitle: string; emoji?: string; children: ReactNode };

/** Shared shell for the login and register screens. */
export function AuthScreen({ title, subtitle, emoji, children }: Props) {
  const c = useColors();
  const hero = useHeroFloat();
  const t = useT();
  const language = useLanguage((s) => s.language);
  const setLanguage = useLanguage((s) => s.pickBeforeLogin);
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Animated.View entering={FadeInDown.duration(500)} style={hero}>
              <Image source={illustrations.authHero} style={styles.hero} contentFit="contain" accessibilityLabel="" />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.brandRow}>
              <Emoji symbol="🚌" size={24} />
              <Text accessibilityRole="header" style={[styles.brand, { color: c.primary }]}>
                RideTrack
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(450).delay(160)} style={styles.brandRow}>
              <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
                {t(title)}
              </Text>
              {emoji ? <Emoji symbol={emoji} size={30} motion="wave" /> : null}
            </Animated.View>
            <Animated.Text entering={FadeInDown.duration(450).delay(220)} style={[styles.subtitle, { color: c.textSecondary }]}>
              {t(subtitle)}
            </Animated.Text>
            <Animated.View entering={FadeInDown.duration(450).delay(300)} style={styles.form}>
              {children}
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(450).delay(380)}>
              <LanguagePicker value={language} onChange={setLanguage} />
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** The hero picture drifts up and down slowly, like a bus on an easy road. */
function useHeroFloat() {
  const v = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) v.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduced, v]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -6 * v.value }] }));
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brand: { ...typography.title },
  title: { ...typography.heading, flexShrink: 1 },
  subtitle: { ...typography.body, marginBottom: spacing.sm },
  form: { gap: spacing.md, marginBottom: spacing.md },
});
