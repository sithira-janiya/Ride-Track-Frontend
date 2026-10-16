/**
 * RideTrack's loading scene: a RideTrack bus driving down a Colombo-style street, with a tuk-tuk and a car in the
 * other lane, a train on the elevated line and the skyline (with a lotus-bud tower) sliding past behind.
 * Original artwork, drawn as plain shapes so the same data renders in the app (LoadingScene, with react-native-svg)
 * and in the web boot screen (BootScreenHtml, as plain SVG + CSS) and both look the same.
 *
 * Units: the scene is 200 units tall and scales to any height. Each layer repeats every `tile` units and scrolls
 * left at `speed` units per second, slower further back, so the street seems to slide past the bus.
 */

export const SCENE_HEIGHT = 200;

/** id of the web boot screen element; the app removes it once its own loader is on screen. */
export const BOOT_HTML_ID = 'rt-boot';

const light = {
  sky: '#D7E7FF',
  sun: '#FFD66B',
  halo: '#FFF3C8',
  cloud: '#FFFFFF',
  star: '#FFFFFF',
  skyline: '#B7CBEE',
  skylineWin: '#DCE8FF',
  rail: '#8C9AB3',
  railDark: '#6F7D96',
  trainBody: '#FFFFFF',
  trainStripe: '#C62828',
  trainWin: '#1E3A8A',
  trainRoof: '#5B6B86',
  leaf: '#3FA66B',
  leafDark: '#2E8B57',
  trunk: '#7A5235',
  pole: '#5B6B86',
  lamp: '#FFE08A',
  wallA: '#F7D9B5',
  wallB: '#FCE3EC',
  awningA: '#E4572E',
  awningB: '#0F766E',
  stripe: '#FFFFFF',
  shopWin: '#9EC2F5',
  sign: '#0B5FFF',
  signGlyph: '#FFFFFF',
  pavement: '#E4E8EF',
  joint: '#CDD3DD',
  curb: '#B9C1CE',
  road: '#3A4050',
  dash: '#F2F5FA',
  busBody: '#0B5FFF',
  busDark: '#0847BF',
  busStripe: '#FFFFFF',
  well: '#06307F',
  window: '#CFE0FF',
  glare: '#FFFFFF',
  led: '#FFC857',
  headlight: '#FFE8A3',
  tail: '#FF6B6B',
  tire: '#1C2230',
  hub: '#C9D2E3',
  tukBody: '#1F9D55',
  tukCanopy: '#1F2937',
  tukInside: '#374151',
  carBody: '#E11D48',
};

export type PaletteKey = keyof typeof light;
export type Palette = Record<PaletteKey, string>;

/** Night version: lit windows, stars, a moon instead of the sun. */
const dark: Palette = {
  sky: '#0F1C36',
  sun: '#F4F1C9',
  halo: '#24324F',
  cloud: '#22314F',
  star: '#FFFFFF',
  skyline: '#1F2E4F',
  skylineWin: '#E9C46A',
  rail: '#3A4762',
  railDark: '#2C3850',
  trainBody: '#D7DEEA',
  trainStripe: '#E57373',
  trainWin: '#FFE8A3',
  trainRoof: '#5B6B86',
  leaf: '#1F6B45',
  leafDark: '#17553A',
  trunk: '#4E3A2A',
  pole: '#7B88A1',
  lamp: '#FFE08A',
  wallA: '#3B3548',
  wallB: '#33394D',
  awningA: '#B5462A',
  awningB: '#0E5E58',
  stripe: '#CBD2DE',
  shopWin: '#FFD98A',
  sign: '#3D7BFF',
  signGlyph: '#FFFFFF',
  pavement: '#2A3142',
  joint: '#232938',
  curb: '#3A4256',
  road: '#1A1F2B',
  dash: '#8E99AD',
  busBody: '#2A64F0',
  busDark: '#1B47B8',
  busStripe: '#DCE6FF',
  well: '#0B1F57',
  window: '#FFE8A3',
  glare: '#FFFFFF',
  led: '#FFC857',
  headlight: '#FFF3C4',
  tail: '#FF6B6B',
  tire: '#0B0E14',
  hub: '#8C97AB',
  tukBody: '#1B8A4B',
  tukCanopy: '#111827',
  tukInside: '#2B3445',
  carBody: '#C81E44',
};

export const sceneColors: Record<'light' | 'dark', Palette> = { light, dark };

export type Shape =
  | { t: 'rect'; x: number; y: number; w: number; h: number; r?: number; fill: PaletteKey; o?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; fill: PaletteKey; o?: number }
  | { t: 'poly'; points: number[]; fill: PaletteKey; o?: number };

/** A strip that repeats every `tile` units and scrolls left at `speed` units per second. */
export type Layer = { id: string; tile: number; speed: number; shapes: Shape[]; darkOnly?: boolean };
/** A picture `w` by `h` units, placed with its top at `y` in the scene. */
export type Sprite = { w: number; h: number; y: number; shapes: Shape[] };

const rect = (x: number, y: number, w: number, h: number, fill: PaletteKey, r?: number, o?: number): Shape => ({ t: 'rect', x, y, w, h, fill, r, o });
const circle = (cx: number, cy: number, r: number, fill: PaletteKey, o?: number): Shape => ({ t: 'circle', cx, cy, r, fill, o });
const poly = (points: number[], fill: PaletteKey, o?: number): Shape => ({ t: 'poly', points, fill, o });

/** Top of the pavement; buildings and trees stand on it. */
const GROUND = 140;
/** How fast the road moves under the bus; everything else is slower. */
const ROAD_SPEED = 90;

function building(x: number, w: number, top: number, windows: boolean): Shape[] {
  const shapes = [rect(x, top, w, GROUND - top, 'skyline')];
  if (windows) {
    for (let y = top + 8; y + 5 <= GROUND - 14; y += 13) {
      for (let wx = x + 5; wx + 4 <= x + w - 5; wx += 10) shapes.push(rect(wx, y, 4, 5, 'skylineWin'));
    }
  }
  return shapes;
}

/** Back to front; the train runs between the last of these and FRONT_LAYERS. */
export const BACK_LAYERS: Layer[] = [
  {
    id: 'stars',
    tile: 300,
    speed: 4,
    darkOnly: true,
    shapes: [
      [20, 14], [64, 32], [98, 10], [140, 44], [176, 20], [214, 36],
      [250, 12], [282, 50], [40, 56], [120, 24], [196, 58], [268, 28],
    ].map(([cx, cy], i) => circle(cx, cy, i % 3 === 0 ? 1.4 : 1, 'star', 0.85)),
  },
  {
    id: 'clouds',
    tile: 420,
    speed: 6,
    shapes: [
      rect(48, 36, 62, 10, 'cloud', 5), circle(60, 36, 12, 'cloud'), circle(78, 30, 16, 'cloud'), circle(98, 36, 12, 'cloud'),
      rect(258, 56, 48, 8, 'cloud', 4), circle(266, 56, 8, 'cloud'), circle(282, 50, 12, 'cloud'), circle(298, 56, 9, 'cloud'),
    ],
  },
  {
    id: 'skyline',
    tile: 360,
    speed: 12,
    shapes: [
      ...building(4, 34, 78, true),
      ...building(42, 26, 96, false),
      ...building(72, 40, 58, true),
      ...building(116, 30, 88, false),
      rect(160, 58, 2, 12, 'skyline'),
      ...building(150, 22, 70, true),
      // lotus-bud tower: stem, bud, spire and a lit band
      rect(209, 44, 5, GROUND - 44, 'skyline'),
      poly([203, 46, 211.5, 26, 220, 46, 211.5, 52], 'skyline'),
      rect(210.5, 12, 2, 16, 'skyline'),
      rect(205, 41, 13, 2.5, 'skylineWin'),
      ...building(176, 30, 92, false),
      ...building(226, 28, 64, true),
      ...building(258, 38, 84, false),
      ...building(300, 24, 100, false),
      ...building(328, 28, 74, true),
    ],
  },
  {
    id: 'rail',
    tile: 120,
    speed: 20,
    shapes: [rect(0, 84, 120, 7, 'rail'), rect(0, 91, 120, 2, 'railDark'), rect(56, 93, 8, GROUND - 93, 'rail'), rect(52, 91, 16, 4, 'railDark')],
  },
];

export const FRONT_LAYERS: Layer[] = [
  {
    id: 'near',
    tile: 320,
    speed: 36,
    shapes: [
      // tree
      rect(26, 112, 5, 28, 'trunk'), circle(20, 110, 9, 'leafDark'), circle(37, 110, 9, 'leafDark'), circle(28, 104, 13, 'leaf'),
      // shop with a striped awning
      rect(56, 108, 66, 32, 'wallA'),
      rect(52, 102, 74, 8, 'awningA'),
      ...[56, 72, 88, 104].map((x) => rect(x, 102, 8, 8, 'stripe')),
      rect(62, 116, 22, 14, 'shopWin', 2), rect(92, 116, 12, 24, 'awningA'), rect(108, 116, 10, 14, 'shopWin', 2),
      // street lamp
      rect(141, 92, 3, 48, 'pole'), rect(141, 92, 10, 2.5, 'pole'), rect(147, 93, 8, 3, 'pole', 1.5), circle(151, 98.5, 2.5, 'lamp'),
      // bus stop sign
      rect(170, 106, 2.5, 34, 'pole'), circle(171.25, 104, 7, 'sign'), rect(167.5, 100.5, 7.5, 6, 'signGlyph', 1.2),
      // tree
      rect(202, 116, 4, 24, 'trunk'), circle(196, 113, 7, 'leaf'), circle(212, 113, 7, 'leaf'), circle(204, 108, 11, 'leafDark'),
      // two-storey shop
      rect(222, 96, 84, 6, 'awningB'),
      rect(226, 100, 76, 40, 'wallB'),
      ...[234, 254, 274].map((x) => rect(x, 104, 14, 8, 'shopWin', 1)),
      rect(230, 114, 68, 7, 'awningB'),
      ...[234, 250, 266, 282].map((x) => rect(x, 114, 8, 7, 'stripe')),
      rect(234, 124, 30, 14, 'shopWin', 2), rect(276, 124, 14, 16, 'awningB'),
      // bush
      circle(312, 134, 6, 'leaf'),
    ],
  },
  {
    id: 'ground',
    tile: 128,
    speed: ROAD_SPEED,
    shapes: [
      rect(0, GROUND, 128, 11, 'pavement'),
      ...[30, 62, 94, 126].map((x) => rect(x, GROUND, 2, 11, 'joint')),
      rect(0, 150, 128, 3, 'curb'),
      rect(0, 153, 128, 47, 'road'),
      rect(10, 174, 36, 3, 'dash', 1.5),
      rect(74, 174, 36, 3, 'dash', 1.5),
    ],
  },
];

/** The sun (or moon) with its halo, fixed in the sky `right` units in from the right edge. `glow` is the halo's radius. */
export const SUN = {
  right: 52,
  cy: 36,
  glow: 22,
  shapes: [circle(22, 22, 22, 'halo'), circle(22, 22, 14, 'sun')],
};

/** The RideTrack bus, driving right in the near lane. Its wheels are separate so they can turn. */
export const BUS: Sprite & { wheels: { cx: number; cy: number }[] } = {
  w: 152,
  h: 64,
  y: 133,
  wheels: [
    { cx: 30, cy: 53 },
    { cx: 118, cy: 53 },
  ],
  shapes: [
    rect(14, 0, 60, 6, 'busDark', 3),
    rect(0, 4, 150, 48, 'busBody', 10),
    rect(0, 40, 150, 12, 'busDark', 6),
    rect(2, 36, 146, 3, 'busStripe'),
    ...[10, 34, 58, 82].map((x) => rect(x, 11, 20, 19, 'window', 3)),
    ...[10, 34].map((x) => poly([x + 3, 27, x + 9, 13, x + 12, 13, x + 6, 27], 'glare', 0.35)),
    rect(106, 11, 15, 29, 'busDark', 2),
    rect(108, 13, 11, 12, 'window', 1.5),
    rect(126, 9, 20, 25, 'window', 4),
    poly([130, 31, 138, 12, 142, 12, 134, 31], 'glare', 0.5),
    rect(129, 5, 14, 3, 'led', 1),
    rect(147, 12, 5, 8, 'busDark', 1.5),
    rect(144, 41, 6, 5, 'headlight', 2),
    rect(0, 40, 4, 7, 'tail', 1.5),
    circle(30, 52, 11.5, 'well'),
    circle(118, 52, 11.5, 'well'),
  ],
};

/** One bus wheel; the spokes show it turning. */
export const WHEEL: Sprite = {
  w: 20,
  h: 20,
  y: 0,
  shapes: [circle(10, 10, 10, 'tire'), circle(10, 10, 5, 'hub'), rect(9.1, 5, 1.8, 10, 'tire'), rect(5, 9.1, 10, 1.8, 'tire'), circle(10, 10, 1.6, 'hub')],
};

/** Tuk-tuk in the far lane, driving left. */
export const TUK: Sprite = {
  w: 54,
  h: 40,
  y: 132.5,
  shapes: [
    rect(6, 2, 46, 7, 'tukCanopy', 3.5),
    rect(46, 6, 5, 20, 'tukCanopy'),
    rect(15, 6, 3, 15, 'tukCanopy'),
    rect(18, 9, 28, 13, 'tukInside'),
    rect(6, 21, 46, 11, 'tukBody', 4),
    poly([2, 32, 5, 16, 16, 12, 18, 12, 18, 32], 'tukBody'),
    poly([6, 21, 9, 10, 15, 10, 15, 21], 'window'),
    circle(4.5, 24, 2, 'headlight'),
    circle(11, 33, 6.5, 'tire'), circle(11, 33, 2.5, 'hub'),
    circle(43, 33, 6.5, 'tire'), circle(43, 33, 2.5, 'hub'),
  ],
};

/** Car in the far lane, driving left after the tuk-tuk. */
export const CAR: Sprite = {
  w: 66,
  h: 34,
  y: 138.5,
  shapes: [
    poly([14, 15, 22, 4, 44, 4, 55, 15], 'carBody'),
    rect(2, 14, 62, 13, 'carBody', 6),
    poly([19, 15, 24, 7, 32, 7, 32, 15], 'window'),
    poly([35, 15, 35, 7, 42, 7, 49, 15], 'window'),
    rect(2, 17, 5, 4, 'headlight', 1.5),
    rect(60, 17, 4, 5, 'tail', 1.5),
    circle(16, 27, 6.5, 'tire'), circle(16, 27, 2.5, 'hub'),
    circle(50, 27, 6.5, 'tire'), circle(50, 27, 2.5, 'hub'),
  ],
};

function carriage(x: number, front: boolean): Shape[] {
  const first = front ? 14 : 8;
  return [
    rect(x + 4, 0, 62, 4, 'trainRoof', 2),
    rect(x, 3, 70, 20, 'trainBody', front ? 7 : 3),
    rect(x, 16, 70, 3, 'trainStripe'),
    ...[0, 1, 2, 3].map((k) => rect(x + first + k * 14, 7, 9, 6, 'trainWin', 1.5)),
    ...(front ? [rect(x + 3, 7, 8, 7, 'trainWin', 2)] : []),
    rect(x + 8, 22, 14, 4, 'tire', 1),
    rect(x + 48, 22, 14, 4, 'tire', 1),
  ];
}

/** Three-car train on the elevated line, heading left. Its bogies sit on the rail at y 84. */
export const TRAIN: Sprite = {
  w: 224,
  h: 28,
  y: 58,
  shapes: [...carriage(0, true), rect(70, 8, 7, 10, 'trainRoof'), ...carriage(77, false), rect(147, 8, 7, 10, 'trainRoof'), ...carriage(154, false)],
};

export const MOTION = {
  /** The bus rocks up and down a little. */
  bob: { ms: 700, lift: 1.4 },
  /** One wheel turn at road speed (circumference 2π·9 units). */
  wheelMs: Math.round(((2 * Math.PI * 9) / ROAD_SPEED) * 1000),
  /** Far-lane traffic, relative to the bus: wait, tuk-tuk passes, short gap, car passes. */
  traffic: { speed: 220, firstDelayMs: 1600, gapMs: 800 },
  /** The train crosses, then the line is empty for a moment. */
  train: { speed: 75, delayMs: 1500 },
};

/** Milliseconds for one full tile to scroll past. */
export const loopMs = (layer: Pick<Layer, 'tile' | 'speed'>) => Math.round((layer.tile / layer.speed) * 1000);

/** Milliseconds for a sprite `spriteW` wide to cross a scene `widthUnits` wide, edge to edge. */
export const crossMs = (widthUnits: number, spriteW: number, speed: number) => Math.round(((widthUnits + spriteW) / speed) * 1000);

/** Tiles needed so the strip still covers `widthUnits` after scrolling one full tile. */
export const copiesToFill = (widthUnits: number, tile: number) => Math.max(1, Math.ceil(widthUnits / tile)) + 1;

export function shapeBounds(s: Shape) {
  if (s.t === 'rect') return { x0: s.x, x1: s.x + s.w, y0: s.y, y1: s.y + s.h };
  if (s.t === 'circle') return { x0: s.cx - s.r, x1: s.cx + s.r, y0: s.cy - s.r, y1: s.cy + s.r };
  const xs = s.points.filter((_, i) => i % 2 === 0);
  const ys = s.points.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

function shiftShape(s: Shape, dx: number): Shape {
  if (s.t === 'rect') return { ...s, x: s.x + dx };
  if (s.t === 'circle') return { ...s, cx: s.cx + dx };
  return { ...s, points: s.points.map((v, i) => (i % 2 === 0 ? v + dx : v)) };
}

/** The layer's shapes repeated `copies` times side by side. */
export function strip(layer: Layer, copies: number): Shape[] {
  return Array.from({ length: copies }, (_, i) => layer.shapes.map((s) => shiftShape(s, i * layer.tile))).flat();
}
