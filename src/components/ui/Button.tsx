import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

import { PressableScale } from './motion';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  /** decorative emoji before the label; kept out of the translated text */
  emoji?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, emoji, style }: Props) {
  const c = useColors();
  const t = useT();
  const bg = variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : 'transparent';
  const fg = variant === 'secondary' ? c.primary : c.onPrimary;
  const label = t(title);
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityLabel={label}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant !== 'secondary' && !inactive ? styles.raised : null,
        {
          backgroundColor: variant === 'secondary' && pressed ? c.infoBg : bg,
          borderColor: variant === 'secondary' ? c.primary : bg,
          opacity: inactive ? 0.5 : 1,
          shadowColor: bg,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {emoji ? (
            <Text accessible={false} importantForAccessibility="no" allowFontScaling={false} style={styles.emoji}>
              {emoji}
            </Text>
          ) : null}
          <Text style={[styles.text, { color: fg }]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: { shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 18, lineHeight: 24 },
  text: { ...typography.bodyLarge, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
});
