import { ReactNode, useEffect } from 'react'
import { useUiStore } from '@/shared/stores/ui.store'
import i18n from '@/app/config/i18n'

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const { language } = useUiStore()

  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])

  return <>{children}</>
}

