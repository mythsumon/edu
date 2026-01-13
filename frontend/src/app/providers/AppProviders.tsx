import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { I18nProvider } from './I18nProvider'
import { AuthInitializer } from './AuthInitializer'
import { ThemeProvider } from './ThemeProvider'
import { TooltipProvider } from '@/shared/ui/tooltip'

interface AppProvidersProps {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryProvider>
      <I18nProvider>
        <ThemeProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={0}>
            <AuthInitializer />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryProvider>
  )
}

