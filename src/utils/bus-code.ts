/** Bus codes as RideTrack-API issues them: upper-case letters and digits (`BUS_CODE_PATTERN` in its `utils/codes.js`). */
export const BUS_CODE_PATTERN = /^[A-Z0-9]{6,16}$/;

/**
 * The bus code inside whatever a scan or a typed entry produced, or null when it is not a bus QR. Accepts:
 * - the sticker's URL, `https://<api host>/b/<code>` (what the QR holds),
 * - the app link the sticker's page opens, `rtexpo://bus/<code>`,
 * - the code on its own, as printed under the QR (any case, spaces ignored).
 * A ticket QR (a signed token, or `mock-qr-…` in mock mode) is not a bus code, so it returns null.
 */
export function parseBusCode(scanned: string): string | null {
  const text = scanned.trim();
  const fromLink = text.match(/(?:\/b\/|:\/\/bus\/|^\/?bus\/)([A-Za-z0-9]+)\/?(?:[?#].*)?$/);
  const candidate = (fromLink ? fromLink[1] : text.replace(/\s/g, '')).toUpperCase();
  return BUS_CODE_PATTERN.test(candidate) ? candidate : null;
}

/** Reads the bus code the Play Store passes through an install (`referrer=bus%3D<code>` on the store link). */
export function busCodeFromReferrer(referrer: string | null | undefined): string | null {
  const match = referrer?.match(/(?:^|&)bus=([A-Za-z0-9]+)(?:&|$)/);
  return match ? parseBusCode(match[1]) : null;
}
