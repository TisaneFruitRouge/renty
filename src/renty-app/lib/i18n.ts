import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import fr from '../translations/fr.json';

const resources = {
  fr: {
    translation: fr,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode, // Get device language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
