import { Alert, Platform } from 'react-native';

/** Asks before an action that is hard to undo. React Native's Alert does nothing on web, so web uses the browser dialog. */
export function confirmAction(title: string, message: string, confirmLabel: string, cancelLabel = 'Cancel'): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) }),
  );
}
