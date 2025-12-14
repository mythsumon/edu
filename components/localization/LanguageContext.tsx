'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Locale, t } from '@/libs/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ko')

  useEffect(() => {
    // Check for saved language preference
    const savedLocale = localStorage.getItem('locale') as Locale | null
    if (savedLocale && (savedLocale === 'ko' || savedLocale === 'en')) {
      setLocale(savedLocale)
    }
  }, [])

  const updateLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const translate = (key: string, params?: Record<string, string>) => {
    return t(locale, key, params)
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale: updateLocale, t: translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}