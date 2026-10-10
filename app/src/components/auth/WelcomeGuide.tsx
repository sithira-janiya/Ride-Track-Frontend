import { Image } from 'expo-image';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, LanguagePicker } from '@/components/ui';
import { illustrations } from '@/components/ui/illustrations';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/language';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

const STEPS = [
  { icon: '👤', title: 'Sign in or create an account', body: 'New accounts are for passengers. Staff and officer accounts come from the transport authority.' },
  { icon: '🔎', title: 'Find your route', body: 'Search by route number or place, or see the stops near you. Save the routes you use most.' },
  { icon: '🚌', title: 'Track it live', body: 'See where your bus or train is, when it will arrive and how full it is.' },
  { icon: '🎟️', title: 'Buy a ticket', body: 'Pick where you get on and off, then pay. Your ticket stays on your phone, even offline.' },
  { icon: '📱', title: 'Show the QR code when you board', body: 'Open the ticket and the conductor scans it. The screen gets brighter to help the scan.' },
  { icon: '🔔', title: 'Get alerts', body: 'Delays, cancellations and route changes for your trips appear in Alerts.' },
] as const;

const ROLES = [
  { icon: '🎫', title: 'Conductors and inspectors', body: 'Sign in with your staff account, choose your shift, then scan tickets in the Scan tab.' },
  { icon: '🏛️', title: 'Transport officers', body: 'Sign in to watch the live fleet, run reports, publish alerts and manage accounts.' },
] as const;

export const DEMO_LOGINS = [
  { label: 'Passenger', identifier: 'passenger@ridetrack.test' },
  { label: 'Conductor', identifier: 'staff@ridetrack.test' },
  { label: 'Officer', identifier: 'officer@ridetrack.test' },
] as const;
export const DEMO_PASSWORD = 'Password1!';

type Props = {
  onDone: () => void;
  /** shows the demo accounts; tapping one opens the login screen with it filled in */
  onDemoLogin?: (identifier: string) => void;
};

function Row({ icon, title, body }: { icon: string; title: string; body: string }) {
  const c = useColors();
  const t = useT();
  return (
    <View style={styles.row}>
      <Text aria-hidden style={styles.icon}>
        {icon}
      </Text>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: c.text }]}>{t(title)}</Text>
        <Text style={[styles.body, { color: c.textSecondary }]}>{t(body)}</Text>
      </View>
    </View>
  );
}

/** "How RideTrack works": shown on first launch, before the login screen. */
export function WelcomeGuide({ onDone, onDemoLogin }: Props) {
  const c = useColors();
  const t = useT();
  const language = useLanguage((s) => s.language);
  const setLanguage = useLanguage((s) => s.pickBeforeLogin);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={[styles.brand, { color: c.primary }]}>RideTrack</Text>
            <Pressable accessibilityRole="button" onPress={onDone} hitSlop={8} style={styles.skip}>
              <Text style={[styles.link, { color: c.primary }]}>{t('Skip')}</Text>
            </Pressable>
          </View>
          <Image source={illustrations.authHero} style={styles.hero} contentFit="contain" accessibilityLabel="" />
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            {t('Welcome! Here is how RideTrack works')}
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {t('Live buses and trains, and tickets on your phone. It takes a minute to read.')}
          </Text>

          <LanguagePicker value={language} onChange={setLanguage} />

          <Card>
            <Text accessibilityRole="header" style={[styles.cardTitle, { color: c.text }]}>
              {t('For passengers')}
            </Text>
            {STEPS.map((s) => (
              <Row key={s.title} {...s} />
            ))}
          </Card>

          <Card>
            <Text accessibilityRole="header" style={[styles.cardTitle, { color: c.text }]}>
              {t('For staff and officers')}
            </Text>
            {ROLES.map((s) => (
              <Row key={s.title} {...s} />
            ))}
          </Card>

          {Platform.OS === 'web' ? (
            <Card>
              <Row
                icon="➕"
                title="Keep RideTrack on your home screen"
                body="On iPhone tap Share, then Add to Home Screen. On Android tap the ⋮ menu, then Add to Home screen or Install app."
              />
            </Card>
          ) : null}

          {onDemoLogin ? (
            <Card>
              <Text accessibilityRole="header" style={[styles.cardTitle, { color: c.text }]}>
                {t('Just trying it out?')}
              </Text>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                {t('Use a demo account. The password for each one is {password}', { password: DEMO_PASSWORD })}
              </Text>
              {DEMO_LOGINS.map((d) => (
                <Pressable
                  key={d.identifier}
                  accessibilityRole="button"
                  accessibilityLabel={t('Log in as the demo {role}', { role: t(d.label) })}
                  onPress={() => onDemoLogin(d.identifier)}
                  style={({ pressed }) => [styles.demo, { borderColor: c.border, backgroundColor: c.background, opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={[styles.rowTitle, { color: c.text }]}>{t(d.label)}</Text>
                  <Text style={[styles.body, { color: c.primary }]} selectable>
                    {d.identifier}
                  </Text>
                </Pressable>
              ))}
            </Card>
          ) : null}

          <Button title="Get started" onPress={onDone} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { ...typography.title },
  skip: { minHeight: minTouchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
  link: { ...typography.body, fontWeight: '700' },
  hero: { width: '100%', height: 120 },
  heading: { ...typography.title },
  cardTitle: { ...typography.bodyLarge, fontWeight: '700' },
  body: { ...typography.body },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  icon: { fontSize: 24, lineHeight: 30, width: 32, textAlign: 'center' },
  rowText: { flex: 1, flexShrink: 1 },
  rowTitle: { ...typography.body, fontWeight: '700' },
  demo: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, minHeight: minTouchTarget },
});
