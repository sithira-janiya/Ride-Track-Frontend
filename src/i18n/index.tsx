import { useCallback } from 'react';
import { Text, type TextProps } from 'react-native';

import { SOURCE_LANGUAGE, useLanguage } from '@/store/language';

import { requestTranslation } from './google-translate';

export { translationEnabled } from './google-translate';

type Params = Record<string, string | number>;
export type Translate = (text: string, params?: Params) => string;

/** Fills `{placeholders}` without translating; the default where a `t` is optional. */
export function fill(text: string, params?: Params) {
  return params ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)) : text;
}

/**
 * Returns `t(english, params?)`, which gives the Google-translated text for the current language.
 * Until the translation arrives (or with no API key / offline) the English text is shown.
 * Put changing values in `{placeholders}` so the template is translated once, not once per value.
 */
export function useT() {
  const language = useLanguage((s) => s.language);
  const dict = useLanguage((s) => s.translations[s.language]);

  return useCallback<Translate>(
    (text, params) => {
      if (language === SOURCE_LANGUAGE || !text.trim()) return fill(text, params);
      const hit = dict?.[text];
      if (hit === undefined) {
        requestTranslation(language, text);
        return fill(text, params);
      }
      // a placeholder lost in translation would show raw "{name}": fall back to English
      const intact = !params || Object.keys(params).every((k) => hit.includes(`{${k}}`));
      return fill(intact ? hit : text, params);
    },
    [language, dict],
  );
}

/** `<Text>` whose string child is translated. `params` fills `{placeholders}` in it. */
export function T({ children, params, ...rest }: TextProps & { children: string; params?: Params }) {
  const t = useT();
  return <Text {...rest}>{t(children, params)}</Text>;
}
