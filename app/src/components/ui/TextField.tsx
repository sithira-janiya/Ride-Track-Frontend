import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useT } from '@/i18n';
import { minTouchTarget, radius, spacing, typography } from '@/theme';

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label: english, error, placeholder, style, ...rest }: Props) {
  const c = useColors();
  const t = useT();
  const label = t(english);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.textSecondary}
        {...rest}
        placeholder={placeholder ? t(placeholder) : undefined}
        style={[
          styles.input,
          { color: c.text, backgroundColor: c.background, borderColor: error ? c.danger : c.border },
          style,
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.error, { color: c.danger }]}>
          ⚠ {t(error)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.body, fontWeight: '600' },
  input: {
    ...typography.body,
    minHeight: minTouchTarget + 4,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  error: { ...typography.caption },
});
