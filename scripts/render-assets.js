#!/usr/bin/env node

/**
 * Renders RideTrack's artwork to the PNG files the app uses.
 *
 * - App icon, Android adaptive icon, splash, favicon and the iOS Icon Composer layers are drawn
 *   from the map-pin-and-bus mark defined below.
 * - Illustrations are rendered from assets/source/*.svg at @1x, @2x and @3x.
 *
 * @resvg/resvg-js is not a project dependency, so install it just for the run:
 *   npm install --no-save @resvg/resvg-js && node scripts/render-assets.js
 */

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const root = process.cwd(); // run from the project root
const images = path.join(root, "assets/images");
const sources = path.join(root, "assets/source");
const iosLayers = path.join(root, "assets/expo.icon/Assets");

const blue = "#0B5FFF";
const blueDark = "#0847BF";
const pale = "#D6E4FF";
const amber = "#FFC24B";

// The mark sits in a 1024 square: pin head centred at (512, 422), tip at (512, 852).
const pinPath = "M512 852C470 800 262 610 262 422A250 250 0 0 1 762 422C762 610 554 800 512 852Z";
const busScale = 'transform="translate(512 430) scale(1.08) translate(-512 -430)"';
const busBody = `
  <rect x="367" y="352" width="22" height="56" rx="10"/>
  <rect x="635" y="352" width="22" height="56" rx="10"/>
  <rect x="414" y="500" width="50" height="70" rx="16"/>
  <rect x="560" y="500" width="50" height="70" rx="16"/>
  <rect x="387" y="302" width="250" height="230" rx="48"/>`;
const busDetails = `
  <rect x="452" y="322" width="120" height="26" rx="13"/>
  <rect x="414" y="366" width="196" height="96" rx="22"/>
  <circle cx="438" cy="498" r="15"/>
  <circle cx="586" cy="498" r="15"/>
  <rect x="470" y="490" width="84" height="16" rx="8"/>`;

const bus = `
<g ${busScale}>
  <rect x="367" y="352" width="22" height="56" rx="10" fill="${blueDark}"/>
  <rect x="635" y="352" width="22" height="56" rx="10" fill="${blueDark}"/>
  <rect x="414" y="500" width="50" height="70" rx="16" fill="${blueDark}"/>
  <rect x="560" y="500" width="50" height="70" rx="16" fill="${blueDark}"/>
  <rect x="387" y="302" width="250" height="230" rx="48" fill="${blue}"/>
  <rect x="452" y="322" width="120" height="26" rx="13" fill="${amber}"/>
  <rect x="414" y="366" width="196" height="96" rx="22" fill="${pale}"/>
  <path d="M430 450L520 378h50L480 450z" fill="#FFFFFF" fill-opacity=".45"/>
  <circle cx="438" cy="498" r="15" fill="#FFFFFF"/>
  <circle cx="586" cy="498" r="15" fill="#FFFFFF"/>
  <rect x="470" y="490" width="84" height="16" rx="8" fill="${blueDark}"/>
</g>`;

const mark = `<path d="${pinPath}" fill="#FFFFFF"/>${bus}`;

// Single colour version for Android 13 themed icons: the bus is cut out of the pin.
const monoMark = `
<defs>
  <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#FFFFFF"/>
    <g ${busScale}>
      <g fill="#000000">${busBody}</g>
      <g fill="#FFFFFF">${busDetails}</g>
    </g>
  </mask>
</defs>
<path d="${pinPath}" fill="#FFFFFF" mask="url(#cut)"/>`;

const gradient = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3D86FF"/>
    <stop offset="1" stop-color="${blueDark}"/>
  </linearGradient>
</defs>`;

/** Moves the mark's centre (512, 512) to (cx, cy) and scales it. */
const place = (content, scale, cx = 512, cy = 512) =>
  `<g transform="translate(${cx} ${cy}) scale(${scale}) translate(-512 -512)">${content}</g>`;

/** Location "pulse" rings and a soft shadow under the pin tip. */
const groundAt = (cy) => `
<ellipse cx="512" cy="${cy}" rx="250" ry="58" fill="none" stroke="#FFFFFF" stroke-opacity=".12" stroke-width="10"/>
<ellipse cx="512" cy="${cy}" rx="150" ry="34" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="10"/>
<ellipse cx="512" cy="${cy}" rx="70" ry="16" fill="#001A66" fill-opacity=".3"/>`;

const svg = (body, width = 1024, height = width, viewBox = `0 0 ${width} ${height}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${body}</svg>`;

function writePng(file, svgText, width) {
  const png = new Resvg(svgText, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  console.log(`${path.relative(root, file)}  ${width}px  ${(png.length / 1024).toFixed(1)} KB`);
}

// App icon: full bleed square, the OS applies the corner mask.
const tipScaled = (scale, cy = 512) => cy + 340 * scale;
writePng(
  path.join(images, "icon.png"),
  svg(`${gradient}<rect width="1024" height="1024" fill="url(#bg)"/>${groundAt(tipScaled(0.86, 492) + 6)}${place(mark, 0.86, 512, 492)}`),
  1024,
);

// Android adaptive icon: keep the foreground inside the 66/108 safe circle.
writePng(
  path.join(images, "android-icon-background.png"),
  svg(`${gradient}<rect width="1024" height="1024" fill="url(#bg)"/>${groundAt(tipScaled(0.78, 500) + 6)}`),
  1024,
);
writePng(path.join(images, "android-icon-foreground.png"), svg(place(mark, 0.78, 512, 500)), 1024);
writePng(path.join(images, "android-icon-monochrome.png"), svg(place(monoMark, 0.78, 512, 500)), 1024);

// Splash: the mark alone on a transparent square; app.json sets the background colour.
writePng(path.join(images, "splash-icon.png"), svg(place(mark, 1)), 1024);

// Favicon: rounded tile so it reads on light and dark browser tabs.
writePng(
  path.join(images, "favicon.png"),
  svg(`${gradient}<rect width="1024" height="1024" rx="224" fill="url(#bg)"/>${place(mark, 1.12, 512, 500)}`),
  48,
);

// iOS Icon Composer layers (assets/expo.icon): same crop for both so they stay aligned.
const layerBox = "262 172 500 680";
fs.writeFileSync(path.join(iosLayers, "pin.svg"), svg(`<path d="${pinPath}" fill="#FFFFFF"/>`, 500, 680, layerBox) + "\n");
fs.writeFileSync(path.join(iosLayers, "bus.svg"), svg(bus, 500, 680, layerBox) + "\n");
console.log("assets/expo.icon/Assets/pin.svg, bus.svg");

// Illustrations at three densities; React Native picks the right one per device.
for (const name of fs.readdirSync(sources).filter((f) => f.endsWith(".svg"))) {
  const text = fs.readFileSync(path.join(sources, name), "utf8");
  const width = Number(/width="(\d+)"/.exec(text)[1]);
  const base = path.join(images, "illustrations", name.replace(/\.svg$/, ""));
  writePng(`${base}.png`, text, width);
  writePng(`${base}@2x.png`, text, width * 2);
  writePng(`${base}@3x.png`, text, width * 3);
}
