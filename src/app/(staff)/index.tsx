import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { scansApi } from '@/api/endpoints';
import { ScanResultPanel } from '@/components/scan/ScanResultPanel';
import { Button, Emoji, ErrorMessage, FadeInView, Loading, ScreenHeader, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { ScanOutcome } from '@/types';

type Phase = { kind: 'scanning' } | { kind: 'checking' } | { kind: 'result'; outcome: ScanOutcome } | { kind: 'error'; message: string };

export default function ScanScreen() {
  const c = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>({ kind: 'scanning' });
  const [manual, setManual] = useState(false);
  const [ticketText, setTicketText] = useState('');

  const reset = () => {
    setTicketText('');
    setPhase({ kind: 'scanning' });
  };

  // one scan at a time: the camera keeps firing while the code is in view, so lock as soon as one lands
  const validate = async (input: { qrToken?: string; ticketId?: number }) => {
    setPhase({ kind: 'checking' });
    try {
      const outcome = await scansApi.validate(input);
      Haptics.notificationAsync(
        outcome.result === 'VALID' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
      setPhase({ kind: 'result', outcome });
    } catch (e) {
      setPhase({ kind: 'error', message: errorMessage(e) });
    }
  };

  const submitManual = () => {
    const id = Number(ticketText.trim());
    if (!Number.isInteger(id) || id <= 0) {
      setPhase({ kind: 'error', message: 'Enter the ticket number as digits only, for example 123.' });
      return;
    }
    validate({ ticketId: id });
  };

  const scanning = phase.kind === 'scanning';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ScreenHeader title="Scan ticket" emoji="📷" emojiMotion="pop" />

          {phase.kind === 'result' ? (
            <ScanResultPanel outcome={phase.outcome} onNext={reset} />
          ) : phase.kind === 'checking' ? (
            <Loading label="Checking ticket…" emoji="🔍" />
          ) : (
            <>
              {phase.kind === 'error' ? <ErrorMessage message={phase.message} onRetry={reset} /> : null}

              {manual ? (
                <FadeInView style={styles.gap}>
                  <TextField
                    label="Ticket number"
                    keyboardType="number-pad"
                    value={ticketText}
                    onChangeText={setTicketText}
                    onSubmitEditing={submitManual}
                    returnKeyType="done"
                    placeholder="e.g. 123"
                  />
                  <Button title="Check ticket" emoji="✅" onPress={submitManual} disabled={!ticketText.trim()} />
                  <Button title="Use camera instead" emoji="📷" variant="secondary" onPress={() => setManual(false)} />
                </FadeInView>
              ) : !permission ? (
                <Loading label="Checking camera access…" emoji="📷" />
              ) : !permission.granted ? (
                <FadeInView style={styles.gap}>
                  <Emoji symbol="📸" size={44} motion="float" />
                  <Text style={[styles.body, { color: c.text }]}>
                    RideTrack needs the camera to scan tickets.
                    {!permission.canAskAgain && Platform.OS !== 'web' ? ' Camera access was blocked. Turn it on in your phone settings.' : ''}
                  </Text>
                  {permission.canAskAgain ? <Button title="Allow camera" emoji="🔓" onPress={requestPermission} /> : null}
                  <Button title="Type ticket number instead" emoji="⌨️" variant="secondary" onPress={() => setManual(true)} />
                </FadeInView>
              ) : (
                <Animated.View entering={FadeIn.duration(300)} style={styles.gap}>
                  <View style={[styles.camera, { borderColor: c.primary }]}>
                    <CameraView
                      style={StyleSheet.absoluteFill}
                      facing="back"
                      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                      onBarcodeScanned={scanning ? ({ data }) => validate({ qrToken: data }) : undefined}
                      accessibilityLabel="Camera view. Point at the passenger's QR code."
                    />
                    <Viewfinder color={c.primary} />
                  </View>
                  <Text style={[styles.body, { color: c.textSecondary }]}>🎯 Point the camera at the passenger&apos;s QR code.</Text>
                  <Button title="QR will not scan? Type ticket number" emoji="⌨️" variant="secondary" onPress={() => setManual(true)} />
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** A scan line that sweeps over the camera so it is clear the scanner is live. Decorative only. */
function Viewfinder({ color }: { color: string }) {
  const v = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) v.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [reduced, v]);
  const line = useAnimatedStyle(() => ({ top: `${10 + v.value * 80}%` }));
  return (
    <View pointerEvents="none" importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.scanLine, { backgroundColor: color, shadowColor: color }, line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: spacing.md },
  gap: { gap: spacing.md },
  body: { ...typography.body },
  camera: { aspectRatio: 1, width: '100%', overflow: 'hidden', borderRadius: 20, borderWidth: 3 },
  scanLine: { position: 'absolute', left: '8%', right: '8%', height: 3, borderRadius: 2, opacity: 0.85, shadowOpacity: 0.9, shadowRadius: 8 },
});
