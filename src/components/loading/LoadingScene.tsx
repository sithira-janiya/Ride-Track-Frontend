import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, useColorScheme, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import {
  BACK_LAYERS,
  BUS,
  CAR,
  copiesToFill,
  crossMs,
  FRONT_LAYERS,
  loopMs,
  MOTION,
  SCENE_HEIGHT,
  sceneColors,
  strip,
  SUN,
  TRAIN,
  TUK,
  WHEEL,
  type Layer,
  type Palette,
  type Shape,
} from './scene';

// the web has no native animation driver; Animated runs those loops in JS there
const useNativeDriver = Platform.OS !== 'web';

/** The system "reduce motion" setting: when on, the scene is drawn still. */
function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => alive && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/** A value that runs 0 → 1 over `ms`, again and again, waiting `delay` before each lap. Stays at 0 when paused. */
function useLoop(ms: number, paused: boolean, delay = 0) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (paused) return;
    const anim = Animated.loop(Animated.timing(value, { toValue: 1, duration: ms, delay, easing: Easing.linear, useNativeDriver }));
    anim.start();
    return () => anim.stop();
  }, [value, ms, delay, paused]);
  return value;
}

/** Far-lane traffic: a tuk-tuk crosses, then a car, then a pause, forever. */
function useTraffic(widthUnits: number, paused: boolean) {
  const [tuk] = useState(() => new Animated.Value(0));
  const [car] = useState(() => new Animated.Value(0));
  const { speed, firstDelayMs, gapMs } = MOTION.traffic;
  const tukMs = crossMs(widthUnits, TUK.w, speed);
  const carMs = crossMs(widthUnits, CAR.w, speed);
  useEffect(() => {
    if (paused) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(tuk, { toValue: 1, duration: tukMs, delay: firstDelayMs, easing: Easing.linear, useNativeDriver }),
        Animated.timing(car, { toValue: 1, duration: carMs, delay: gapMs, easing: Easing.linear, useNativeDriver }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [tuk, car, tukMs, carMs, firstDelayMs, gapMs, paused]);
  return { tuk, car };
}

function renderShape(s: Shape, i: number, colors: Palette) {
  const fill = colors[s.fill];
  if (s.t === 'rect') return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} fill={fill} opacity={s.o} />;
  if (s.t === 'circle') return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={fill} opacity={s.o} />;
  return <Polygon key={i} points={s.points.join(' ')} fill={fill} opacity={s.o} />;
}

type ArtProps = { w: number; h: number; scale: number; shapes: Shape[]; colors: Palette };

function Art({ w, h, scale, shapes, colors }: ArtProps) {
  return (
    <Svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`}>
      {shapes.map((s, i) => renderShape(s, i, colors))}
    </Svg>
  );
}

type LayerProps = { layer: Layer; scale: number; widthUnits: number; colors: Palette; paused: boolean };

/** A repeating strip that slides left by one tile per lap, so the loop has no visible seam. */
function ScrollingLayer({ layer, scale, widthUnits, colors, paused }: LayerProps) {
  const lap = useLoop(loopMs(layer), paused);
  const copies = copiesToFill(widthUnits, layer.tile);
  const stripW = copies * layer.tile;
  const translateX = lap.interpolate({ inputRange: [0, 1], outputRange: [0, -layer.tile * scale] });
  return (
    <Animated.View style={[styles.abs, { transform: [{ translateX }] }]}>
      <Art w={stripW} h={SCENE_HEIGHT} scale={scale} shapes={strip(layer, copies)} colors={colors} />
    </Animated.View>
  );
}

type StreetProps = { width: number; scale: number; colors: Palette; dark: boolean; paused: boolean };

function Street({ width, scale, colors, dark, paused }: StreetProps) {
  const widthUnits = width / scale;
  const train = useLoop(crossMs(widthUnits, TRAIN.w, MOTION.train.speed), paused, MOTION.train.delayMs);
  const { tuk, car } = useTraffic(widthUnits, paused);
  const bob = useLoop(MOTION.bob.ms, paused);
  const spin = useLoop(MOTION.wheelMs, paused);

  // right edge → just past the left edge; with reduced motion each sprite stands still at `still` of the way across
  const across = (value: Animated.Value, spriteW: number, still: number) => {
    const from = width;
    const to = -spriteW * scale;
    return paused ? from + (to - from) * still : value.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  };
  const layers = (list: Layer[]) =>
    list
      .filter((l) => dark || !l.darkOnly)
      .map((l) => <ScrollingLayer key={l.id} layer={l} scale={scale} widthUnits={widthUnits} colors={colors} paused={paused} />);

  const glow = SUN.glow * 2;
  return (
    <>
      <View style={[styles.abs, { left: width - (SUN.right + SUN.glow) * scale, top: (SUN.cy - SUN.glow) * scale }]}>
        <Art w={glow} h={glow} scale={scale} shapes={SUN.shapes} colors={colors} />
      </View>

      {layers(BACK_LAYERS)}

      <Animated.View style={[styles.abs, { top: TRAIN.y * scale, transform: [{ translateX: across(train, TRAIN.w, 0.55) }] }]}>
        <Art w={TRAIN.w} h={TRAIN.h} scale={scale} shapes={TRAIN.shapes} colors={colors} />
      </Animated.View>

      {layers(FRONT_LAYERS)}

      <Animated.View style={[styles.abs, { top: TUK.y * scale, transform: [{ translateX: across(tuk, TUK.w, 0.3) }] }]}>
        <Art w={TUK.w} h={TUK.h} scale={scale} shapes={TUK.shapes} colors={colors} />
      </Animated.View>
      <Animated.View style={[styles.abs, { top: CAR.y * scale, transform: [{ translateX: across(car, CAR.w, 1) }] }]}>
        <Art w={CAR.w} h={CAR.h} scale={scale} shapes={CAR.shapes} colors={colors} />
      </Animated.View>

      <Animated.View
        style={[
          styles.abs,
          {
            left: (width - BUS.w * scale) / 2,
            top: BUS.y * scale,
            transform: [{ translateY: bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -MOTION.bob.lift * scale, 0] }) }],
          },
        ]}>
        <Art w={BUS.w} h={BUS.h} scale={scale} shapes={BUS.shapes} colors={colors} />
        {BUS.wheels.map((wheel) => (
          <Animated.View
            key={wheel.cx}
            style={[
              styles.abs,
              {
                left: (wheel.cx - WHEEL.w / 2) * scale,
                top: (wheel.cy - WHEEL.h / 2) * scale,
                transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
              },
            ]}>
            <Art w={WHEEL.w} h={WHEEL.h} scale={scale} shapes={WHEEL.shapes} colors={colors} />
          </Animated.View>
        ))}
      </Animated.View>
    </>
  );
}

type Props = {
  /** Height in px; the artwork scales to it and fills whatever width the view gets. */
  height: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Looping street scene for loading states (artwork in ./scene). Purely decorative: hidden from screen readers, so
 * the parent says what is loading. Light and dark mode get day and night versions; with the system "reduce motion"
 * setting on, it is drawn still.
 */
export function LoadingScene({ height, style }: Props) {
  const dark = useColorScheme() === 'dark';
  const colors = sceneColors[dark ? 'dark' : 'light'];
  const paused = useReduceMotion();
  const [width, setWidth] = useState(0);
  const scale = height / SCENE_HEIGHT;
  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[styles.scene, { height, backgroundColor: colors.sky }, style]}>
      {width > 0 ? <Street width={width} scale={scale} colors={colors} dark={dark} paused={paused} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { overflow: 'hidden', pointerEvents: 'none' },
  abs: { position: 'absolute', left: 0, top: 0 },
});
