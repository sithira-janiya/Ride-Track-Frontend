import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Emoji, PressableScale } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useAlertBanner } from '@/store/alert-banner';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

/** Springs down over any passenger screen when a new alert arrives. Tap to open the alerts list. */
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
    <Animated.View
      key={message}
      entering={SlideInUp.springify().damping(16)}
      exiting={SlideOutUp.duration(220)}
      pointerEvents="box-none"
      style={[styles.banner, { top: insets.top + spacing.sm }]}>
      <PressableScale
        accessibilityRole="alert"
        accessibilityLabel={`${t('New alert')}: ${t(message)}. ${t('Tap to view all alerts.')}`}
        onPress={() => {
          dismiss();
          router.navigate('/alerts');
        }}
        style={[styles.card, { backgroundColor: c.warningBg, borderColor: c.warning }]}>
        <View style={styles.row}>
          <Emoji symbol="🔔" size={20} motion="wave" />
          <Text style={[styles.title, { color: c.warning }]}>{t('New alert')}</Text>
        </View>
        <Text style={[styles.body, { color: c.text }]}>{t(message)}</Text>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    minHeight: minTouchTarget,
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  title: { ...typography.caption, fontWeight: '700' },
  body: { ...typography.body },
});
