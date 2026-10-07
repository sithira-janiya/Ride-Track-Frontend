import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SOURCE_LANGUAGE = 'en';

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල' },
  { value: 'ta', label: 'தமிழ்' },
] as const;

type LanguageState = {
  /** ISO 639-1 code the UI is shown in */
  language: string;
  /** Google Translate results, kept on the device so each string is only translated once: language → English text → translation */
  translations: Record<string, Record<string, string>>;
  setLanguage: (language: string) => void;
  addTranslations: (language: string, entries: Record<string, string>) => void;
};

/** UI language, kept on the device so the login screen opens in the last language used. */
export const useLanguage = create<LanguageState>()(
  persist(
    (set) => ({
      language: SOURCE_LANGUAGE,
      translations: {},
      setLanguage: (language) => set({ language }),
      addTranslations: (language, entries) =>
        set((s) => ({ translations: { ...s.translations, [language]: { ...s.translations[language], ...entries } } })),
    }),
    { name: 'ridetrack.language', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
