import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from '@/assets/lang/en.json'
import koTranslations from '@/assets/lang/ko.json'

// Get stored language from localStorage if available
const getStoredLanguage = (): string => {
  try {
    const stored = localStorage.getItem('sidebar_collapsed')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.state?.language || 'en'
    }
  } catch {
    // Ignore errors
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ko: {
        translation: koTranslations,
      },
    },
    lng: getStoredLanguage(), // Initialize with stored language
    fallbackLng: 'en', // Fallback language if translation is missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  })

export default i18n

