// Shared motion layer: press feedback, entrances and decorative emoji. Screen-to-screen transitions are set on the navigators.
// Every animation respects the OS "reduce motion" setting (Reanimated's default ReduceMotion.System for
// layout animations, and useReducedMotion for the hand-driven ones below).
import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const springs = {
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  pop: { damping: 11, stiffness: 180 },
} as const;

/** A light tap on phones; silently skipped on web and when haptics are unavailable. */
export function tapFeedback(kind: 'light' | 'select' = 'light') {
  if (Platform.OS === 'web') return;
  const p = kind === 'select' ? Haptics.selectionAsync() : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  p.catch(() => {});
}

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** how far it shrinks while held, 0.97 by default */
  scaleTo?: number;
  haptic?: boolean;
  children?: ReactNode;
};

/**
 * Pressable that springs down while held and back on release.
 * An animated Pressable ignores a function `style`, so the pressed state is tracked here and the style resolved up front.
 */
export function PressableScale({ scaleTo = 0.97, haptic = true, onPressIn, onPressOut, onPress, style, disabled, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        if (!reduced) scale.set(withSpring(scaleTo, springs.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        scale.set(withSpring(1, springs.press));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tapFeedback();
        onPress?.(e);
      }}
      style={[typeof style === 'function' ? style({ pressed }) : style, animated]}>
      {children}
    </AnimatedPressable>
  );
}

/** Slides up and fades in on mount. Pass `index` to stagger items in a list. */
export function FadeInView({ index = 0, delay = 0, style, children }: { index?: number; delay?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(delay + Math.min(index, 8) * 55)} style={style}>
      {children}
    </Animated.View>
  );
}

type EmojiProps = {
  symbol: string;
  size?: number;
  style?: StyleProp<TextStyle>;
  /** idle animation: gentle bob, a wave/wiggle, or a heartbeat pulse */
  motion?: 'float' | 'wave' | 'pulse' | 'pop';
};

/** Decorative emoji, hidden from screen readers so status is still read from the text beside it. */
export function Emoji({ symbol, size = 24, style, motion }: EmojiProps) {
  const v = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!motion || reduced) return;
    if (motion === 'float') v.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    else if (motion === 'pulse') v.value = withRepeat(withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 700 })), -1);
    else if (motion === 'wave')
      v.value = withDelay(
        250,
        withRepeat(withSequence(withTiming(1, { duration: 140 }), withTiming(-1, { duration: 140 }), withTiming(0, { duration: 140 })), 2),
      );
    else if (motion === 'pop') {
      v.value = 0;
      v.value = withSpring(1, springs.pop);
    }
  }, [motion, reduced, v, symbol]);

  const animated = useAnimatedStyle(() => {
    switch (motion) {
      case 'float':
        return { transform: [{ translateY: -4 * v.value }] };
      case 'pulse':
        return { transform: [{ scale: 1 + 0.12 * v.value }] };
      case 'wave':
        return { transform: [{ rotate: `${18 * v.value}deg` }] };
      case 'pop':
        return reduced ? {} : { transform: [{ scale: 0.4 + 0.6 * v.value }] };
      default:
        return {};
    }
  });

  return (
    <Animated.Text
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      allowFontScaling={false}
      style={[{ fontSize: size, lineHeight: Math.round(size * 1.25) }, style, animated]}>
      {symbol}
    </Animated.Text>
  );
}

/** Tab bar icon: the emoji springs up when its tab becomes active and dims when inactive. */
export function TabEmoji({ symbol, focused }: { symbol: string; focused: boolean }) {
  const v = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    v.value = withSpring(focused ? 1 : 0, springs.pop);
  }, [focused, v]);
  const animated = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * v.value,
    transform: [{ scale: 0.92 + 0.14 * v.value }],
  }));
  return (
    <Animated.View style={animated}>
      <Text allowFontScaling={false} style={styles.tabEmoji}>
        {symbol}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabEmoji: { fontSize: 20, lineHeight: 24 },
});
