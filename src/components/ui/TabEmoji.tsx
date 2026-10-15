import { StyleSheet, Text, View, type ColorValue } from 'react-native';

import { radius } from '@/theme';

// Emoji tab bar icon. The label beside it carries the meaning, so the emoji is hidden from screen readers.
// Emoji ignore tint colour, so the active tab gets a pill tinted with the role accent (`color`) and the others are dimmed.
export function tabEmoji(emoji: string) {
  return function TabEmojiIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
    return (
      <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.pill}>
        {focused ? <View style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: color }]} /> : null}
        <Text maxFontSizeMultiplier={1.2} style={[styles.emoji, { opacity: focused ? 1 : 0.55 }]}>
          {emoji}
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  pill: { width: 52, height: 28, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tint: { opacity: 0.14 },
  emoji: { fontSize: 20, lineHeight: 26 },
});
