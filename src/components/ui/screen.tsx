import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

type Props = {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  children: ReactNode;
};

/** Standard page wrapper: safe area, background, padding and an optional title. */
export function Screen({ title, subtitle, scroll = true, children }: Props) {
  const content = (
    <View style={styles.content}>
      {title ? (
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodyMedium" style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, padding: spacing.md, gap: spacing.md },
  header: { gap: spacing.xs },
  title: { color: colors.text, fontWeight: '700' },
  subtitle: { color: colors.textMuted },
});
