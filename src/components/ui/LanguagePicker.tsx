import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { translationEnabled, useT } from '@/i18n';
import { LANGUAGES, SOURCE_LANGUAGE, useLanguage } from '@/store/language';
import { spacing, typography } from '@/theme';

import { Chips } from './Chips';

type Props = { value: string; onChange: (language: string) => void };

/** Language chips. Names are shown in their own script so they are readable whatever language is active. */
export function LanguagePicker({ value, onChange }: Props) {
  const c = useColors();
  const t = useT();
  const error = useLanguage((s) => s.translationError);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.text }]}>{t('Language')}</Text>
      <Chips label="Language" options={[...LANGUAGES]} value={value} onChange={onChange} translateOptions={false} />
      {value !== SOURCE_LANGUAGE ? (
        <Text style={[styles.caption, { color: c.textSecondary }]}>
          {translationEnabled
            ? t('Translated by Google')
            : 'Translation is not set up in this build, so the app stays in English.'}
        </Text>
      ) : null}
      {value !== SOURCE_LANGUAGE && error ? (
        // shown untranslated: translating is what failed
        <Text accessibilityRole="alert" style={[styles.caption, { color: c.danger }]}>
          {`Google Translate failed, so the app stays in English: ${error}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  label: { ...typography.body, fontWeight: '700' },
  caption: { ...typography.caption },
});
