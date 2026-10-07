import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAlertBanner } from '@/store/alert-banner';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

/** Slides in over any passenger screen when a new alert arrives. Tap to open the alerts list. */
export function AlertBanner() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { message, dismiss } = useAlertBanner();

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(dismiss, 8000);
    return () => clearTimeout(id);
  }, [message, dismiss]);

  if (!message) return null;
  return (
    <Pressable
      accessibilityRole="alert"
      accessibilityLabel={`${t('New alert')}: ${t(message)}. ${t('Tap to view all alerts.')}`}
      onPress={() => {
        dismiss();
        router.navigate('/alerts');
      }}
      style={[styles.banner, { top: insets.top + spacing.sm, backgroundColor: c.warningBg, borderColor: c.warning }]}>
      <Text style={[styles.title, { color: c.warning }]}>! {t('New alert')}</Text>
      <Text style={[styles.body, { color: c.text }]}>{t(message)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
    minHeight: minTouchTarget,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    maxWidth: 560,
    alignSelf: 'center',
  },
  title: { ...typography.caption, fontWeight: '700' },
  body: { ...typography.body },
});
