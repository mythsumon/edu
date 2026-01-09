import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/shared/stores/ui.store'
import { Menu, Moon, Sun } from 'lucide-react'

export const Header = () => {
  const { t } = useTranslation()
  const { toggleSidebar, theme, toggleTheme } = useUiStore()

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">{t('header.title')}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  )
}

