import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { scansApi } from '@/api/endpoints';
import { QrCamera } from '@/components/scan/QrCamera';
import { ScanResultPanel } from '@/components/scan/ScanResultPanel';
import { Button, ErrorMessage, Loading, TextField } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { spacing, typography } from '@/theme';
import type { ScanOutcome } from '@/types';

type Phase = { kind: 'scanning' } | { kind: 'checking' } | { kind: 'result'; outcome: ScanOutcome } | { kind: 'error'; message: string };

export default function ScanScreen() {
  const c = useColors();
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
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Scan ticket
          </Text>

          {phase.kind === 'result' ? (
            <ScanResultPanel outcome={phase.outcome} onNext={reset} />
          ) : phase.kind === 'checking' ? (
            <Loading label="Checking ticket…" />
          ) : (
            <>
              {phase.kind === 'error' ? <ErrorMessage message={phase.message} onRetry={reset} /> : null}

              {manual ? (
                <View style={styles.gap}>
                  <TextField
                    label="Ticket number"
                    keyboardType="number-pad"
                    value={ticketText}
                    onChangeText={setTicketText}
                    onSubmitEditing={submitManual}
                    returnKeyType="done"
                    placeholder="e.g. 123"
                  />
                  <Button title="Check ticket" onPress={submitManual} disabled={!ticketText.trim()} />
                  <Button title="Use camera instead" variant="secondary" onPress={() => setManual(false)} />
                </View>
              ) : (
                <QrCamera
                  onScan={scanning ? (data) => validate({ qrToken: data }) : null}
                  permissionMessage="RideTrack needs the camera to scan tickets."
                  hint="Point the camera at the passenger's QR code."
                  fallback={{ label: 'QR will not scan? Type ticket number', blockedLabel: 'Type ticket number instead', onPress: () => setManual(true) }}
                />
              )}
            </>
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
});
