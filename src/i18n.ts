import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from "./locales/en/translation";
import arTranslation from "./locales/ar/translation";

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {translation: enTranslation},
            ar: {translation: arTranslation},
        },
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false
        },
        supportedLngs: ['en', 'ar'],
        // Backend configuration
        backend: {}
    })

export default i18n;