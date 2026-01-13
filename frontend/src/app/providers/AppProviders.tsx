import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { I18nProvider } from './I18nProvider'
import { AuthInitializer } from './AuthInitializer'
import { TooltipProvider } from '@/shared/ui/tooltip'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <I18nProvider>
        <TooltipProvider>
          <AuthInitializer />
          {children}
        </TooltipProvider>
      </I18nProvider>
    </QueryProvider>
  )
}

