
import { storage } from '../utils/storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import sv from '../locales/sv.json';

const resources = {
  en: { translation: en },
  sv: { translation: sv }
};

const LANGUAGE_KEY = 'app_language';

let isInitialized = false;

const initLanguage = async () => {
  if (isInitialized) return;

  // Try to get saved language
  const savedLanguage = await storage.getItem(LANGUAGE_KEY);
  
  // If no saved language, use device language
  const deviceLanguage = Localization.getLocales()[0].languageCode;
  const defaultLanguage = savedLanguage || (deviceLanguage === 'sv' ? 'sv' : 'en');

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
  
  isInitialized = true;
};

// Save language when it changes
i18n.on('languageChanged', (lng) => {
  storage.setItem(LANGUAGE_KEY, lng);
});

export { initLanguage };
export default i18n;