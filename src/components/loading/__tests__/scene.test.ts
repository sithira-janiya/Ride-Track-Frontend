import { BACK_LAYERS, BUS, CAR, copiesToFill, crossMs, FRONT_LAYERS, loopMs, SCENE_HEIGHT, sceneColors, shapeBounds, strip, SUN, TRAIN, TUK, WHEEL, type Shape } from '../scene';

const layers = [...BACK_LAYERS, ...FRONT_LAYERS];
const sprites = { BUS, CAR, TRAIN, TUK, WHEEL, SUN: { w: SUN.glow * 2, h: SUN.glow * 2, shapes: SUN.shapes } };

function expectInside(shapes: Shape[], w: number, h: number) {
  for (const s of shapes) {
    const b = shapeBounds(s);
    expect(b.x0).toBeGreaterThanOrEqual(0);
    expect(b.x1).toBeLessThanOrEqual(w);
    expect(b.y0).toBeGreaterThanOrEqual(0);
    expect(b.y1).toBeLessThanOrEqual(h);
  }
}

describe('loading scene artwork', () => {
  it.each(layers.map((l) => [l.id, l] as const))('the %s layer stays inside its tile, so the loop has no seam', (_, layer) => {
    expectInside(layer.shapes, layer.tile, SCENE_HEIGHT);
  });

  it.each(Object.entries(sprites))('%s stays inside its box', (_, sprite) => {
    expectInside(sprite.shapes, sprite.w, sprite.h);
  });

  it('only uses colours that both the day and night palettes define', () => {
    const used = [...layers.flatMap((l) => l.shapes), ...Object.values(sprites).flatMap((s) => s.shapes)].map((s) => s.fill);
    for (const key of used) {
      expect(sceneColors.light[key]).toMatch(/^#[0-9A-F]{6}$/i);
      expect(sceneColors.dark[key]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('places the bus wheels on the road and the train on the rail', () => {
    expect(BUS.y + BUS.h).toBeLessThanOrEqual(SCENE_HEIGHT);
    expect(TRAIN.y + 26).toBe(84);
  });
});

describe('loading scene timing', () => {
  it('repeats enough tiles to cover the width even after scrolling a whole tile', () => {
    for (const width of [0, 1, 359, 360, 361, 440, 1200]) {
      const copies = copiesToFill(width, 360);
      expect((copies - 1) * 360).toBeGreaterThanOrEqual(width);
      expect(strip(BACK_LAYERS[2], copies)).toHaveLength(BACK_LAYERS[2].shapes.length * copies);
    }
  });

  it('turns distance and speed into milliseconds', () => {
    expect(loopMs({ tile: 128, speed: 90 })).toBe(1422);
    expect(crossMs(400, 54, 220)).toBe(2064);
  });
});
