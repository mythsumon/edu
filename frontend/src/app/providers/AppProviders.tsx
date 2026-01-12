import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { I18nProvider } from './I18nProvider'
import { AuthInitializer } from './AuthInitializer'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <I18nProvider>
        <AuthInitializer />
        {children}
      </I18nProvider>
    </QueryProvider>
  )
}

