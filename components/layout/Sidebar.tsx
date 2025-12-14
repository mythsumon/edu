'use client'

import { Home, BarChart3, Users, Settings, FileText } from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'

const getMenuItems = (t: (key: string) => string) => [
  { icon: Home, label: t('sidebar.home'), href: '/' },
  { icon: BarChart3, label: t('sidebar.dashboard'), href: '/dashboard', active: true },
  { icon: Users, label: t('sidebar.institutions'), href: '/institutions' },
  { icon: FileText, label: t('sidebar.programs'), href: '/programs' },
  { icon: Settings, label: t('sidebar.settings'), href: '/settings' },
]

export function Sidebar() {
  const { t } = useLanguage()

  const menuItems = getMenuItems(t)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">{t('sidebar.title')}</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}



