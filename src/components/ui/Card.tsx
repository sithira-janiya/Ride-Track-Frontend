import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { radius, spacing } from '@/theme';

type Props = ViewProps & { style?: StyleProp<ViewStyle> };

export function Card({ style, ...rest }: Props) {
  const c = useColors();
  return <View {...rest} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
});
