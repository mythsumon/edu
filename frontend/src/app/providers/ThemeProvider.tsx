import { useEffect } from 'react'
import { useUiStore } from '@/shared/stores/ui.store'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Add the current theme class
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
