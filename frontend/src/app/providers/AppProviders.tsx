import { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { I18nProvider } from './I18nProvider'
import { AuthInitializer } from './AuthInitializer'
import { ThemeProvider } from './ThemeProvider'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { Toaster } from '@/shared/ui/toaster'

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
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryProvider>
  )
}

