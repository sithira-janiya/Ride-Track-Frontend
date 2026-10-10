import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Newer built-ins the web bundle calls, for older phone browsers (iOS 12+ Safari, older Android Chrome and Samsung
 * Internet). Plain ES5 that runs before the bundle; each one is only added when the browser lacks it.
 * scripts/web-compat.js lowers the bundle's syntax to match.
 */
const POLYFILLS = `(function () {
  var g = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window;
  if (typeof globalThis === 'undefined') g.globalThis = g;
  function def(o, k, v) { if (o && !(k in o)) Object.defineProperty(o, k, { value: v, writable: true, configurable: true }); }
  function at(i) { var n = this.length; i = Math.trunc(i) || 0; if (i < 0) i += n; return i < 0 || i >= n ? undefined : this[i]; }
  def(Array.prototype, 'at', at);
  def(String.prototype, 'at', at);
  def(Array.prototype, 'findLast', function (f, t) { for (var i = this.length - 1; i >= 0; i--) if (f.call(t, this[i], i, this)) return this[i]; });
  def(Array.prototype, 'findLastIndex', function (f, t) { for (var i = this.length - 1; i >= 0; i--) if (f.call(t, this[i], i, this)) return i; return -1; });
  def(Object, 'hasOwn', function (o, k) { return Object.prototype.hasOwnProperty.call(Object(o), k); });
  def(Object, 'fromEntries', function (it) { var o = {}; Array.from(it, function (e) { o[e[0]] = e[1]; }); return o; });
  def(String.prototype, 'replaceAll', function (s, r) {
    if (s instanceof RegExp) return this.replace(s, r);
    return this.replace(new RegExp(String(s).replace(/[.*+?^$()|[\\]{}\\\\]/g, '\\\\$&'), 'g'), r);
  });
  def(String.prototype, 'trimStart', String.prototype.trimLeft);
  def(String.prototype, 'trimEnd', String.prototype.trimRight);
  def(g, 'queueMicrotask', function (cb) { Promise.resolve().then(cb).catch(function (e) { setTimeout(function () { throw e; }); }); });
  def(Promise, 'allSettled', function (ps) {
    return Promise.all(Array.from(ps, function (p) {
      return Promise.resolve(p).then(function (value) { return { status: 'fulfilled', value: value }; }, function (reason) { return { status: 'rejected', reason: reason }; });
    }));
  });
  if (g.crypto && g.crypto.getRandomValues) def(g.crypto, 'randomUUID', function () {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function (c) { return (c ^ (g.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16); });
  });
})();`;

// matches the splash and app backgrounds, so there is no white flash in dark mode while the bundle loads
const BACKGROUND = `body { background-color: #FFFFFF; }
@media (prefers-color-scheme: dark) { body { background-color: #0B0E14; } }`;

/** The HTML shell of every web page (static rendering). Native builds do not use it. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover: draw under the notch, then the safe-area insets keep content clear of it */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0B5FFF" />
        <meta name="description" content="Live buses and trains, and QR tickets on your phone." />
        {/* "Add to Home Screen" opens it like an app */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="RideTrack" />
        <link rel="apple-touch-icon" href="/icon-1024.png" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: POLYFILLS }} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: BACKGROUND }} />
      </head>
      <body>
        <noscript>RideTrack needs JavaScript. Turn it on in your browser settings, then reload this page.</noscript>
        {children}
      </body>
    </html>
  );
}
