'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  Users, 
  Building2, 
  FileText, 
  UserCog, 
  Settings,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useState } from 'react'

interface MenuItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const menuConfig: MenuGroup[] = [
  {
    label: '대시보드',
    icon: LayoutDashboard,
    items: [
      { label: '전체 프로그램 현황', href: '/' },
    ],
  },
  {
    label: '교육 운영',
    icon: BookOpen,
    items: [
      { label: '교육 관리', href: '/education' },
    ],
  },
  {
    label: '강사 배정',
    icon: GraduationCap,
    items: [
      { label: '강사 신청 관리', href: '/instructor/application' },
      { label: '강사 배정 관리', href: '/instructor/assignment' },
      { label: '출강 확정 관리', href: '/instructor/confirmation' },
    ],
  },
  {
    label: '기준정보 관리',
    icon: Building2,
    items: [
      { label: '교육기관 관리', href: '/institution' },
      { label: '프로그램 관리', href: '/program' },
      { label: '강사 관리', href: '/instructor' },
    ],
  },
  {
    label: '시스템 관리',
    icon: Settings,
    items: [
      { label: '설정 및 사용자 관리', href: '/system/settings' },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)

  const isItemActive = (href: string) => pathname === href

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-gray-100 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-white">{t('sidebar.title')}</h1>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full flex justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuConfig.map((group) => {
            const GroupIcon = group.icon
            const isOpen = openGroups[group.label] || group.items.some(item => isItemActive(item.href))
            const isGroupHovered = hoveredGroup === group.label
            
            return (
              <li 
                key={group.label} 
                className="mb-1"
                onMouseEnter={() => !isCollapsed && setHoveredGroup(group.label)}
                onMouseLeave={() => !isCollapsed && setHoveredGroup(null)}
              >
                {/* Group Header */}
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      // In collapsed mode, expand the sidebar when clicking a menu group
                      setIsCollapsed(false)
                      // Also open the clicked group
                      setOpenGroups(prev => ({
                        ...prev,
                        [group.label]: true
                      }))
                    } else {
                      // In expanded mode, toggle the group normally
                      toggleGroup(group.label)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    group.items.some(item => isItemActive(item.href))
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {GroupIcon && <GroupIcon className="w-5 h-5" />}
                    {!isCollapsed && <span className="font-medium">{group.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Group Items - Show dropdown when open or when collapsed and hovered */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isCollapsed 
                    ? (isGroupHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
                    : (isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
                }`}>
                  {!isCollapsed ? (
                    <ul className="mt-1 space-y-1 pl-4 pb-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = isItemActive(item.href)
                        
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              {ItemIcon && <ItemIcon className="w-4 h-4" />}
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    // Tooltip-like dropdown for collapsed state
                    isGroupHovered && (
                      <div className="fixed left-20 ml-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50 py-2">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon
                          const isActive = isItemActive(item.href)
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors mx-2 ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              {ItemIcon && <ItemIcon className="w-4 h-4" />}
                              <span>{item.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}