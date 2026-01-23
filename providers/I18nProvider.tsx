'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import krTranslations from '@/locales/kr/translation.json';
import enTranslations from '@/locales/en/translation.json';

type Locale = 'kr' | 'en';
type Translations = typeof krTranslations & typeof enTranslations;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Locale, any> = {
  kr: krTranslations,
  en: enTranslations,
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('kr');

  useEffect(() => {
    // Check for saved language preference
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && (savedLocale === 'kr' || savedLocale === 'en')) {
      setLocale(savedLocale);
    }
  }, []);

  const updateLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (!value || !value[k]) {
        // Fallback to Korean if translation not found
        value = translations.kr;
        for (const fk of keys) {
          if (!value || !value[fk]) return key;
          value = value[fk];
        }
        break;
      }
      value = value[k];
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: updateLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};