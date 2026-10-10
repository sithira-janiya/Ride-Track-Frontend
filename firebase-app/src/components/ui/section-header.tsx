import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, spacing } from '@/constants/theme';

/** Title row for a block of content on a screen, with optional helper text. */
export function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs, marginTop: spacing.sm },
  title: { fontWeight: '700', color: colors.text },
  hint: { color: colors.textMuted },
});
