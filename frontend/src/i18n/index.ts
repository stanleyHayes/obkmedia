import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en, fr } from './resources';

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
] as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'obk-lang',
      caches: ['localStorage'],
    },
    returnObjects: true,
  });

// Keep <html lang> in sync for accessibility and SEO.
const syncLang = (lng: string) => {
  document.documentElement.lang = (lng || 'en').split('-')[0];
};
syncLang(i18n.resolvedLanguage ?? 'en');
i18n.on('languageChanged', syncLang);

export default i18n;
