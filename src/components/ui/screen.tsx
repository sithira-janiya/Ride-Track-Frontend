import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  /** Shows the navy header band. Leave out for a plain page. */
  title?: string;
  subtitle?: string;
  /** Round back button on the left of the header. */
  back?: boolean;
  /** Something small on the right of the header, such as a count or an icon button. */
  headerRight?: ReactNode;
  /** Extra content inside the navy band under the title, for example a white search card. */
  headerExtra?: ReactNode;
  /** Full navy page with no header, for the landing screen. */
  landing?: boolean;
  scroll?: boolean;
  children: ReactNode;
};

/**
 * Standard page wrapper. With a title it draws the navy header from the prototype and a light
 * body with rounded top corners; without one it is a plain light page.
 */
export function Screen({ title, subtitle, back, headerRight, headerExtra, landing, scroll = true, children }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (landing) {
    return (
      <View style={[styles.landing, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
        {children}
      </View>
    );
  }

  const header = title ? (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.headerRow}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.onNavy} />
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          <Text variant="titleLarge" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {headerRight}
      </View>
      {headerExtra}
    </View>
  ) : null;

  const body = <View style={[styles.body, title ? styles.bodyRounded : { paddingTop: insets.top + spacing.md }]}>{children}</View>;

  if (!scroll) {
    return (
      <View style={styles.page}>
        {header}
        {body}
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      {header}
      {body}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  landing: { flex: 1, backgroundColor: colors.navy, paddingHorizontal: spacing.lg },
  header: { backgroundColor: colors.navy, paddingHorizontal: spacing.md, paddingBottom: spacing.lg + spacing.sm, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  title: { color: colors.onNavy, fontWeight: '700' },
  subtitle: { color: colors.onNavyMuted },
  body: { flex: 1, padding: spacing.md, gap: spacing.md, backgroundColor: colors.background },
  bodyRounded: { marginTop: -radius.xl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
});
