import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QrCamera } from '@/components/scan/QrCamera';
import { Button, ErrorMessage, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';
import { parseBusCode } from '@/utils/bus-code';

/**
 * Scan the QR sticker inside a bus to open that bus: where it is, its route and trip, and a ticket for it.
 * The phone's own camera works too (the sticker's page opens the app); this saves leaving the app.
 */
export default function ScanBusScreen() {
  const c = useColors();
  const t = useT();
  const router = useRouter();
  const [manual, setManual] = useState(false);
  const [codeText, setCodeText] = useState('');
  const [error, setError] = useState<string | null>(null);
  // the camera keeps reporting a code while it is in view: take one, then wait until the screen is shown again
  const [locked, setLocked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLocked(false);
    }, []),
  );

  const open = (scanned: string) => {
    const code = parseBusCode(scanned);
    if (!code) {
      setError(manual ? 'Bus codes are 6 to 16 letters and numbers.' : 'This is not a RideTrack bus QR code. Scan the code inside the bus.');
      return;
    }
    setLocked(true);
    setError(null);
    setCodeText('');
    router.push({ pathname: '/bus/[code]', params: { code } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            {t('Scan your bus')}
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {t('Every RideTrack bus has a QR code inside. Scan it to follow the bus live and buy your ticket for it.')}
          </Text>

          {error ? <ErrorMessage message={error} /> : null}

          {manual ? (
            <View style={styles.gap}>
              <TextField
                label="Bus code"
                value={codeText}
                onChangeText={(v) => {
                  setCodeText(v);
                  setError(null);
                }}
                onSubmitEditing={() => open(codeText)}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="go"
                placeholder="e.g. DEMOBUS101"
              />
              <Text style={[styles.caption, { color: c.textSecondary }]}>{t('The driver can show you the bus code.')}</Text>
              <Button title="Open bus" onPress={() => open(codeText)} disabled={!codeText.trim()} />
              <Button title="Use camera instead" variant="secondary" onPress={() => setManual(false)} />
            </View>
          ) : (
            <QrCamera
              onScan={locked ? null : open}
              permissionMessage="RideTrack needs the camera to scan the QR code in the bus."
              hint="Point the camera at the QR code inside the bus."
              fallback={{ label: 'QR will not scan? Type the bus code', blockedLabel: 'Type the bus code instead', onPress: () => setManual(true) }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  gap: { gap: spacing.md },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
