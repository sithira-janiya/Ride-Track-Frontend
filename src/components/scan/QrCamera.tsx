import { CameraView, useCameraPermissions } from 'expo-camera';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Button, Loading } from '@/components/ui';
import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { spacing, typography } from '@/theme';

type Props = {
  /** null pauses scanning: the camera keeps firing while a code is in view, so pause as soon as one lands */
  onScan: ((data: string) => void) | null;
  /** why RideTrack needs the camera, shown before access is granted */
  permissionMessage: string;
  /** what to point the camera at */
  hint: string;
  /** the way round a blocked camera (`blockedLabel`) or a code that will not scan (`label`), e.g. typing it in */
  fallback: { label: string; blockedLabel: string; onPress: () => void };
};

/** Camera permission flow and a QR scanner (staff ticket scan, passenger bus scan). Text props are translated here. */
export function QrCamera({ onScan, permissionMessage, hint, fallback }: Props) {
  const c = useColors();
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <Loading label="Checking camera access…" />;

  if (!permission.granted) {
    return (
      <View style={styles.gap}>
        <Text style={[styles.body, { color: c.text }]}>
          {t(permissionMessage)}
          {!permission.canAskAgain && Platform.OS !== 'web' ? ` ${t('Camera access was blocked. Turn it on in your phone settings.')}` : ''}
        </Text>
        {permission.canAskAgain ? <Button title="Allow camera" onPress={requestPermission} /> : null}
        <Button title={fallback.blockedLabel} variant="secondary" onPress={fallback.onPress} />
      </View>
    );
  }

  return (
    <View style={styles.gap}>
      <View style={[styles.camera, { borderColor: c.primary }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onScan ? ({ data }) => onScan(data) : undefined}
          accessibilityLabel={`${t('Camera view.')} ${t(hint)}`}
        />
      </View>
      <Text style={[styles.body, { color: c.textSecondary }]}>{t(hint)}</Text>
      <Button title={fallback.label} variant="secondary" onPress={fallback.onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: spacing.md },
  body: { ...typography.body },
  camera: { aspectRatio: 1, width: '100%', overflow: 'hidden', borderRadius: 20, borderWidth: 3 },
});
