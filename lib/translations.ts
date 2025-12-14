import ko from '../locales/ko.json'
import en from '../locales/en.json'

const translations: Record<string, any> = {
  ko,
  en,
}

export type Locale = 'ko' | 'en'

export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    if (!value || !value[k]) {
      // Fallback to Korean if translation not found
      value = translations.ko
      for (const fk of keys) {
        if (!value || !value[fk]) return key
        value = value[fk]
      }
      break
    }
    value = value[k]
  }
  
  if (typeof value === 'string' && params) {
    let result = value
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue)
    }
    return result
  }
  
  return value || key
}