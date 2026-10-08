import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { spacing } from '@/theme';

/** Scrolling body for an admin sub-screen. The stack header above it already handles the top safe area. */
export function AdminPage({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
});
