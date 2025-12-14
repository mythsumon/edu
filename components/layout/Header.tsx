'use client'

import { Bell, User, Languages } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/components/localization/LanguageContext'

export function Header() {
  const { locale, setLocale, t } = useLanguage()
  const [notifications] = useState(3)

  const toggleLanguage = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('header.title')}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Languages className="w-5 h-5" />
          <span className="text-sm">{locale === 'ko' ? 'KO' : 'EN'}</span>
        </button>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-5 h-5" />
          <span className="text-sm">{t('header.profile')}</span>
        </button>
      </div>
    </header>
  )
}