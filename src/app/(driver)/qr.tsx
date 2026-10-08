import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '@/api/client';
import { Button, Card, EmptyState, ErrorMessage, Loading } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useDriverMe, useRotateQr } from '@/hooks/use-driver';
import { spacing, typography } from '@/theme';
import { confirmAction } from '@/utils/confirm';

/**
 * The bus's QR code, the one on the sticker inside. Passengers scan it to open this bus in RideTrack. A passenger can
 * also scan it straight off this screen, and the driver can read out the code if a camera will not scan.
 */
export default function DriverQrScreen() {
  const c = useColors();
  const me = useDriverMe();
  const rotate = useRotateQr();
  const bus = me.data?.bus;

  const replace = async () => {
    const ok = await confirmAction(
      'Replace the QR code?',
      'Do this if the sticker was copied or damaged. The old sticker stops working at once, so print and put up the new one straight away.',
      'Replace',
    );
    if (ok) rotate.mutate();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={[styles.heading, { color: c.text }]}>
            Bus QR code
          </Text>

          {me.isPending ? (
            <Loading label="Loading your bus…" />
          ) : me.isError ? (
            <ErrorMessage message={errorMessage(me.error)} onRetry={() => me.refetch()} />
          ) : !bus ? (
            <EmptyState title="No bus assigned yet" message="Your bus's QR code appears here once your administrator assigns you a bus." />
          ) : (
            <>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Passengers scan this code inside bus {bus.regNo} to follow it live and buy a ticket for it.
              </Text>
              <View style={styles.qrWrap}>
                {/* scanners need dark-on-white regardless of theme */}
                <View accessible accessibilityLabel={`QR code for bus ${bus.regNo}`} style={styles.qrBox}>
                  <QRCode value={bus.qr.url} size={240} />
                </View>
                <Text maxFontSizeMultiplier={1.3} selectable style={[styles.code, { color: c.text }]}>
                  {bus.qr.code}
                </Text>
                <Text style={[styles.caption, { color: c.textSecondary }]}>Bus code. Passengers can type it in if their camera will not scan.</Text>
              </View>

              <Card>
                <Text style={[styles.label, { color: c.text }]}>Printing the sticker</Text>
                <Text selectable style={[styles.caption, { color: c.textSecondary }]}>
                  {bus.qr.url}
                </Text>
                <Button title="Share link to print" variant="secondary" onPress={() => Share.share({ message: bus.qr.url }).catch(() => {})} />
              </Card>

              {rotate.isError ? <ErrorMessage message={errorMessage(rotate.error)} /> : null}
              {rotate.isSuccess ? (
                <Text accessibilityLiveRegion="polite" style={[styles.body, { color: c.success }]}>
                  ✓ New code {rotate.data.code}. Print it and replace the sticker in the bus.
                </Text>
              ) : null}
              <Button title="Replace QR code" variant="danger" loading={rotate.isPending} onPress={replace} />
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
  heading: { ...typography.heading },
  label: { ...typography.body, fontWeight: '700' },
  body: { ...typography.body },
  caption: { ...typography.caption },
  code: { fontSize: 32, lineHeight: 40, fontWeight: '800', letterSpacing: 4 },
  qrWrap: { alignItems: 'center', gap: spacing.sm },
  qrBox: { backgroundColor: '#FFFFFF', padding: spacing.md, borderRadius: spacing.md },
});
