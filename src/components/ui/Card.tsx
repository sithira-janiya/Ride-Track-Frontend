import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useCardSurface } from '@/hooks/use-colors';
import { radius, spacing } from '@/theme';

type Props = ViewProps & { style?: StyleProp<ViewStyle> };

/** White card on the grey page, with a 1px border and a soft shadow in light mode. */
export function Card({ style, ...rest }: Props) {
  const surface = useCardSurface();
  return <View {...rest} style={[styles.card, surface, style]} />;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
});
