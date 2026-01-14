'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Check for saved theme preference, default to light mode
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      
      if (savedTheme) {
        setTheme(savedTheme)
      } else {
        // Default to light mode if no saved preference
        setTheme('light')
        localStorage.setItem('theme', 'light')
      }
    }
  }, [])

  useEffect(() => {
    // Apply theme to document whenever theme changes
    if (typeof document !== 'undefined' && document.documentElement) {
      try {
        const htmlElement = document.documentElement
        if (theme === 'dark') {
          if (!htmlElement.classList.contains('dark')) {
            htmlElement.classList.add('dark')
          }
        } else {
          if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark')
          }
        }
      } catch (error) {
        // Silently handle DOM manipulation errors (can occur during React Strict Mode)
        console.warn('Theme application error:', error)
      }
    }
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}