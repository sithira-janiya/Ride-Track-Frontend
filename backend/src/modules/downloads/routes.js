import fs from 'node:fs';

import { Router } from 'express';
import QRCode from 'qrcode';

import { env } from '../../config/env.js';
import { wrap } from '../../utils/async.js';
import { notFound } from '../../utils/errors.js';

/**
 * Getting the app. The QR code always encodes the same URL (`/download/start`): a page that first explains how to
 * install the Android app or open the web version, so a printed code keeps working when a new APK is built
 * (replace the file at APK_PATH, or point APK_URL at the new build).
 */
const router = Router();

export const androidDownloadUrl = () => `${env.publicUrl}/download/android`;
export const startUrl = () => `${env.publicUrl}/download/start`;

const qrOptions = { errorCorrectionLevel: 'M', margin: 2, width: 512 };
// replaces helmet's default, whose upgrade-insecure-requests breaks the QR image on a plain-HTTP (LAN) deployment
const CSP = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const apkAvailable = () => Boolean(env.apkUrl) || fs.existsSync(env.apkPath);
const platformOf = (ua = '') => (/android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) ? 'ios' : 'other');

// plain HTML and CSS, no script: it has to open on any phone browser, old ones included
const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0B5FFF">
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 17px; line-height: 1.5; background: #EEF3FF; color: #101828; -webkit-text-size-adjust: 100%; }
  header { background: #0B5FFF; color: #fff; padding: 20px 16px 28px; padding-top: max(20px, env(safe-area-inset-top)); text-align: center; }
  header b { font-size: 24px; } header p { margin: 4px 0 0; opacity: .9; }
  main { max-width: 560px; margin: -16px auto 0; padding: 0 12px 24px; padding-bottom: max(24px, env(safe-area-inset-bottom)); }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(16,24,40,.12); }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 19px; margin: 0 0 8px; }
  ol { margin: 0 0 12px; padding-left: 22px; } li { margin-bottom: 6px; }
  .btn { display: block; text-align: center; padding: 14px 16px; min-height: 48px; border-radius: 12px; background: #0B5FFF; color: #fff; font-weight: 600; text-decoration: none; }
  .btn.alt { background: #fff; color: #0B5FFF; border: 2px solid #0B5FFF; }
  .note { color: #475467; font-size: 15px; margin: 8px 0 0; }
  img { display: block; width: 300px; max-width: 80vw; height: auto; margin: 8px auto; background: #fff; border-radius: 16px; padding: 12px; }
  code { word-break: break-all; font-size: 14px; }
</style></head>
<body>${body}</body></html>`;

function androidCard(first) {
  if (!apkAvailable()) {
    return `<section class="card"><h2>&#128241; Android app</h2>
  <p>The Android app is not ready to download yet. Use RideTrack in your browser for now.</p></section>`;
  }
  return `<section class="card" id="android"><h2>&#128241; Android phone: install the app</h2>
  <ol>
    <li>Tap <b>Download for Android</b>.</li>
    <li>When it finishes, open <b>RideTrack.apk</b> from the notification or your Downloads.</li>
    <li>If Android asks, allow your browser to <b>install unknown apps</b>, then go back.</li>
    <li>Tap <b>Install</b>, then <b>Open</b>.</li>
  </ol>
  <a class="btn${first ? '' : ' alt'}" href="/download/android">Download for Android</a>
  <p class="note">Needs Android 7.0 or newer.</p></section>`;
}

function webCard(first) {
  if (!env.webAppUrl) return '';
  return `<section class="card" id="web"><h2>&#127760; Any phone: use it in your browser</h2>
  <p>Works on iPhone, Android and other phones. Nothing to install.</p>
  <ol>
    <li>Tap <b>Open RideTrack</b>.</li>
    <li>To keep it on your home screen: on iPhone tap <b>Share</b>, then <b>Add to Home Screen</b>. On Android tap <b>&#8942;</b>, then <b>Add to Home screen</b>.</li>
  </ol>
  <a class="btn${first ? '' : ' alt'}" href="${esc(env.webAppUrl)}">Open RideTrack</a></section>`;
}

const USING_THE_APP = `<section class="card"><h2>Then, in the app</h2>
  <ol>
    <li><b>Sign in</b>, or <b>create an account</b> (new accounts are passengers).</li>
    <li><b>Passengers:</b> search for your route, watch buses and trains live, buy a ticket and show its QR code when you board.</li>
    <li><b>Conductors and inspectors:</b> open <b>Scan</b> and point the camera at the passenger's ticket QR code.</li>
    <li><b>Transport officers:</b> see the live fleet and reports, and publish delay alerts.</li>
  </ol></section>`;

/** What the QR code opens: instructions first, then the download or the web version, best option for this phone on top. */
router.get('/start', (req, res) => {
  const platform = platformOf(req.get('user-agent'));
  const cards = platform === 'ios' && env.webAppUrl ? [webCard(true), androidCard(false)] : [androidCard(true), webCard(!apkAvailable())];
  res.set('Content-Security-Policy', CSP).type('html').send(
    page(
      'Get RideTrack',
      `<header><b>RideTrack</b><p>Live buses and trains, and QR tickets</p></header>
<main>
  <section class="card"><h1>Welcome! Here's how to start</h1><p>Pick the option for your phone and follow the steps.</p></section>
  ${cards.join('\n  ')}
  ${USING_THE_APP}
</main>`,
    ),
  );
});

router.get('/android', (req, res, next) => {
  if (env.apkUrl) return res.redirect(302, env.apkUrl);
  if (!fs.existsSync(env.apkPath)) return next(notFound('The Android app is not available yet.', 'APK_NOT_FOUND'));
  // Content-Disposition: attachment makes the phone's browser download it straight away; the type comes from ".apk".
  // no-cache: revalidate (ETag) so a rebuilt APK is never served stale.
  return res.download(env.apkPath, 'RideTrack.apk', { headers: { 'Cache-Control': 'no-cache' } }, (err) => err && !res.headersSent && next(err));
});

const qrSvg = wrap(async (_req, res) => {
  res.type('image/svg+xml').send(await QRCode.toString(startUrl(), { ...qrOptions, type: 'svg' }));
});
const qrPng = wrap(async (_req, res) => {
  res.type('png').send(await QRCode.toBuffer(startUrl(), qrOptions));
});
router.get(['/qr.svg', '/android/qr.svg'], qrSvg);
router.get(['/qr.png', '/android/qr.png'], qrPng);

/** A page to show or print: the QR code plus a link for people already on their phone. */
router.get('/', (_req, res) => {
  const url = startUrl();
  res.set('Content-Security-Policy', CSP).type('html').send(
    page(
      'Get RideTrack',
      `<header><b>RideTrack</b><p>Live buses and trains, and QR tickets</p></header>
<main><section class="card" style="text-align:center">
  <h1>Scan to get RideTrack</h1>
  <p>Point your phone camera at the code. You'll see how to install the app or open it in your browser.</p>
  <img src="/download/qr.svg" alt="QR code for ${esc(url)}">
  <a class="btn" href="/download/start">Already on your phone? Tap here</a>
  <p class="note"><code>${esc(url)}</code></p>
</section></main>`,
    ),
  );
});

export default router;
