// Web only, rendered into the static HTML by src/app/+html.tsx. It shows the same street scene as BootLoader while
// the JavaScript bundle downloads (the page is otherwise blank until then), drawn as plain SVG and animated with CSS.
// BootLoader removes it once the app's own loader is on screen.
import type { CSSProperties } from 'react';

import { BOOT_SCENE_MAX_WIDTH, BOOT_THEME } from './boot-theme';
import {
  BACK_LAYERS,
  BOOT_HTML_ID,
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

/** CSS cannot read the scene's width, so the far-lane timings assume a typical phone-sized scene. */
const ASSUMED_WIDTH = 400;

function shape(s: Shape, i: number) {
  const style: CSSProperties = { fill: `var(--rt-${s.fill})`, opacity: s.o };
  if (s.t === 'rect') return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} style={style} />;
  if (s.t === 'circle') return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} style={style} />;
  return <polygon key={i} points={s.points.join(' ')} style={style} />;
}

function art(w: number, h: number, shapes: Shape[], className: string, style?: CSSProperties) {
  return (
    <svg className={className} style={style} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
      {shapes.map(shape)}
    </svg>
  );
}

const layer = (l: Layer) => {
  const copies = copiesToFill(BOOT_SCENE_MAX_WIDTH, l.tile);
  return <div key={l.id}>{art(copies * l.tile, SCENE_HEIGHT, strip(l, copies), `rt-l-${l.id}${l.darkOnly ? ' rt-dark-only' : ''}`)}</div>;
};

const vars = (p: Palette) =>
  Object.entries(p)
    .map(([k, v]) => `--rt-${k}:${v}`)
    .join(';');

const pct = (ms: number, cycle: number) => `${((ms / cycle) * 100).toFixed(2)}%`;

function crossingCss() {
  const { speed, firstDelayMs, gapMs } = MOTION.traffic;
  const tukMs = crossMs(ASSUMED_WIDTH, TUK.w, speed);
  const carMs = crossMs(ASSUMED_WIDTH, CAR.w, speed);
  const traffic = firstDelayMs + tukMs + gapMs + carMs;
  const trainMs = crossMs(ASSUMED_WIDTH, TRAIN.w, MOTION.train.speed);
  const train = MOTION.train.delayMs + trainMs;
  return [
    `@keyframes rt-k-tuk{0%,${pct(firstDelayMs, traffic)}{left:100%}${pct(firstDelayMs + tukMs, traffic)},100%{left:-${TUK.w}px}}`,
    `@keyframes rt-k-car{0%,${pct(firstDelayMs + tukMs + gapMs, traffic)}{left:100%}100%{left:-${CAR.w}px}}`,
    `@keyframes rt-k-train{0%,${pct(MOTION.train.delayMs, train)}{left:100%}100%{left:-${TRAIN.w}px}}`,
    `.rt-scene>.rt-tuk{top:${TUK.y}px;left:100%;animation:rt-k-tuk ${traffic}ms linear infinite}`,
    `.rt-scene>.rt-car{top:${CAR.y}px;left:100%;animation:rt-k-car ${traffic}ms linear infinite}`,
    `.rt-scene>.rt-train{top:${TRAIN.y}px;left:100%;animation:rt-k-train ${train}ms linear infinite}`,
  ].join('');
}

/** Styles for the boot screen; goes in a <style> in the page head. */
export const bootScreenCss = [
  `#${BOOT_HTML_ID}{${vars(sceneColors.light)};position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;box-sizing:border-box;background:${BOOT_THEME.light.background};font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`,
  `.rt-brand{margin:0;font-size:28px;line-height:34px;font-weight:700;color:${BOOT_THEME.light.brand}}`,
  `.rt-label{margin:0;font-size:16px;line-height:24px;text-align:center;color:${BOOT_THEME.light.label}}`,
  `.rt-scene{position:relative;width:100%;max-width:${BOOT_SCENE_MAX_WIDTH}px;height:${SCENE_HEIGHT}px;overflow:hidden;border-radius:24px;border:2px solid ${BOOT_THEME.light.frame};box-sizing:border-box;background:var(--rt-sky)}`,
  `.rt-scene>div{position:absolute;top:0;left:0}`,
  `.rt-scene svg{display:block}`,
  `.rt-scene>.rt-sun{left:auto;right:${SUN.right - SUN.glow}px;top:${SUN.cy - SUN.glow}px}`,
  `.rt-dark-only{display:none!important}`,
  ...[...BACK_LAYERS, ...FRONT_LAYERS].map(
    (l) => `@keyframes rt-k-${l.id}{to{transform:translateX(-${l.tile}px)}}.rt-l-${l.id}{animation:rt-k-${l.id} ${loopMs(l)}ms linear infinite}`,
  ),
  crossingCss(),
  `@keyframes rt-k-bob{50%{transform:translateY(-${MOTION.bob.lift}px)}}`,
  `@keyframes rt-k-spin{to{transform:rotate(360deg)}}`,
  `.rt-scene>.rt-bus{left:calc(50% - ${BUS.w / 2}px);top:${BUS.y}px;width:${BUS.w}px;height:${BUS.h}px;animation:rt-k-bob ${MOTION.bob.ms}ms linear infinite}`,
  `.rt-wheel{position:absolute;animation:rt-k-spin ${MOTION.wheelMs}ms linear infinite}`,
  `@media (prefers-color-scheme:dark){#${BOOT_HTML_ID}{${vars(sceneColors.dark)};background:${BOOT_THEME.dark.background}}.rt-brand{color:${BOOT_THEME.dark.brand}}.rt-label{color:${BOOT_THEME.dark.label}}.rt-scene{border-color:${BOOT_THEME.dark.frame}}.rt-dark-only{display:block!important}}`,
  `@media (prefers-reduced-motion:reduce){#${BOOT_HTML_ID} *{animation:none!important}}`,
].join('');

const glow = SUN.glow * 2;

/** The boot screen markup: brand, street scene, one line of text. */
export function BootScreenHtml() {
  return (
    <div id={BOOT_HTML_ID} role="progressbar" aria-label="Loading RideTrack">
      <p className="rt-brand">RideTrack</p>
      <div className="rt-scene">
        <div className="rt-sun">
          {art(glow, glow, SUN.shapes, '')}
        </div>
        {BACK_LAYERS.map(layer)}
        <div className="rt-train">{art(TRAIN.w, TRAIN.h, TRAIN.shapes, '')}</div>
        {FRONT_LAYERS.map(layer)}
        <div className="rt-tuk">{art(TUK.w, TUK.h, TUK.shapes, '')}</div>
        <div className="rt-car">{art(CAR.w, CAR.h, CAR.shapes, '')}</div>
        <div className="rt-bus">
          {art(BUS.w, BUS.h, BUS.shapes, '')}
          {BUS.wheels.map((w) => (
            <div key={w.cx} className="rt-wheel" style={{ left: w.cx - WHEEL.w / 2, top: w.cy - WHEEL.h / 2, width: WHEEL.w, height: WHEEL.h }}>
              {art(WHEEL.w, WHEEL.h, WHEEL.shapes, '')}
            </div>
          ))}
        </div>
      </div>
      <p className="rt-label">Getting your journey ready…</p>
    </div>
  );
}
