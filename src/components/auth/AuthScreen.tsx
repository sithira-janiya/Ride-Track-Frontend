import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';

type Props = { title: string; subtitle: string; children: ReactNode };

/** Shared shell for the login and register screens. */
export function AuthScreen({ title, subtitle, children }: Props) {
  const c = useColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text accessibilityRole="header" style={[styles.brand, { color: c.primary }]}>
              RideTrack
            </Text>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
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
  brand: { ...typography.title },
  title: { ...typography.heading },
  subtitle: { ...typography.body, marginBottom: spacing.sm },
  form: { gap: spacing.md },
});
