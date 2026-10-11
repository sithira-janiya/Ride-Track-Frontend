import { Text } from 'react-native';

// Emoji tab bar icon. The label beside it carries the meaning, so the emoji is hidden from screen readers.
// Emoji ignore tint colour, so the inactive tabs are dimmed instead.
export function tabEmoji(emoji: string) {
  return function TabEmojiIcon({ focused }: { focused: boolean }) {
    return (
      <Text
        accessible={false}
        importantForAccessibility="no"
        maxFontSizeMultiplier={1.2}
        style={{ fontSize: 22, lineHeight: 28, opacity: focused ? 1 : 0.5 }}>
        {emoji}
      </Text>
    );
  };
}
