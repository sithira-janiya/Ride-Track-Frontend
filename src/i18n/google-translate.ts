import { env } from '@/config/env';
import { SOURCE_LANGUAGE, useLanguage } from '@/store/language';

// Google Cloud Translation API (Basic, v2): https://cloud.google.com/translate/docs/reference/rest/v2/translate
const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';
/** v2 accepts at most 128 strings per request */
const BATCH_SIZE = 100;
/** gather the strings a screen asks for during one render pass into a single request */
const FLUSH_DELAY_MS = 30;
/** after a failed request (offline, quota), wait before asking for the same strings again */
const RETRY_AFTER_MS = 60_000;

export const translationEnabled = env.googleTranslateApiKey.length > 0;

const queued = new Map<string, Set<string>>(); // language → texts
const requested = new Set<string>(); // `${language}\n${text}`, queued or in flight
let timer: ReturnType<typeof setTimeout> | null = null;

async function translateBatch(texts: string[], target: string): Promise<string[]> {
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(env.googleTranslateApiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, source: SOURCE_LANGUAGE, target, format: 'text' }),
  });
  if (!res.ok) throw new Error(`Google Translate responded ${res.status}`);
  const json = (await res.json()) as { data: { translations: { translatedText: string }[] } };
  return json.data.translations.map((t) => t.translatedText);
}

async function flush() {
  timer = null;
  const work = [...queued.entries()];
  queued.clear();

  for (const [language, set] of work) {
    const texts = [...set];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const chunk = texts.slice(i, i + BATCH_SIZE);
      try {
        const out = await translateBatch(chunk, language);
        useLanguage.getState().addTranslations(language, Object.fromEntries(chunk.map((text, j) => [text, out[j] ?? text])));
        chunk.forEach((text) => requested.delete(`${language}\n${text}`));
      } catch (e) {
        if (__DEV__) console.warn('[i18n]', e);
        // English stays on screen; allow another attempt later
        setTimeout(() => chunk.forEach((text) => requested.delete(`${language}\n${text}`)), RETRY_AFTER_MS);
      }
    }
  }
}

/** Ask Google Translate for `text` in `language`. The result lands in the language store and re-renders whoever asked. */
export function requestTranslation(language: string, text: string) {
  if (!translationEnabled) return;
  const key = `${language}\n${text}`;
  if (requested.has(key)) return;
  requested.add(key);
  if (!queued.has(language)) queued.set(language, new Set());
  queued.get(language)!.add(text);
  timer ??= setTimeout(flush, FLUSH_DELAY_MS);
}
