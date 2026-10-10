import { StyleSheet, Text } from 'react-native';

/**
 * Tab bar icon. Emoji render on every phone and browser without an icon font, so the tab bar never falls back to
 * React Navigation's placeholder. Decorative: the tab's label is what screen readers announce.
 */
export function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text aria-hidden allowFontScaling={false} style={[styles.icon, { opacity: focused ? 1 : 0.55 }]}>
      {symbol}
    </Text>
  );
}

/** For a tab's `tabBarIcon` option. */
export function tabIcon(symbol: string) {
  return function TabBarIcon({ focused }: { focused: boolean }) {
    return <TabIcon symbol={symbol} focused={focused} />;
  };
}

const styles = StyleSheet.create({
  icon: { fontSize: 20, lineHeight: 24, textAlign: 'center' },
});
