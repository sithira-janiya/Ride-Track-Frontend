import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguagePicker } from '@/components/ui';
import { illustrations } from '@/components/ui/illustrations';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/language';
import { spacing, typography } from '@/theme';

type Props = { title: string; subtitle: string; children: ReactNode };

/** Shared shell for the login and register screens. */
export function AuthScreen({ title, subtitle, children }: Props) {
  const c = useColors();
  const t = useT();
  const language = useLanguage((s) => s.language);
  const setLanguage = useLanguage((s) => s.setLanguage);
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
