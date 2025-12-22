'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileCheck,
  Calendar,
  ChevronDown,
  Menu,
  BookOpen,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface MenuItem {
  labelKey: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  labelKey: string
  icon?: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const instructorMenuConfig: MenuGroup[] = [
  {
    labelKey: 'sidebar.dashboard',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'sidebar.myDashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    labelKey: 'sidebar.educationManagement',
    icon: BookOpen,
    items: [
      { labelKey: 'sidebar.educationApplication', href: '/instructor/application', icon: ClipboardCheck },
      { labelKey: 'sidebar.educationAssignment', href: '/instructor/assignment', icon: GraduationCap },
      { labelKey: 'sidebar.teachingConfirmation', href: '/instructor/confirmation', icon: UserCheck },
    ],
  },
]

interface InstructorSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function InstructorSidebar({ isCollapsed, setIsCollapsed }: InstructorSidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { userRole } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)

  // Only show instructor sidebar if user is instructor
  if (userRole !== 'instructor') {
    return null
  }

  const isItemActive = (href: string) => pathname === href

  const toggleGroup = (labelKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [labelKey]: !prev[labelKey]
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#3a2e2a] text-white flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#4a3e3a] flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-white">{t('sidebar.title')}</h1>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-white/70 hover:text-[#ff8a65] hover:bg-[#4a3e3a] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-white/70 hover:text-[#ff8a65] hover:bg-[#4a3e3a] transition-colors w-full flex justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {instructorMenuConfig.map((group) => {
            const GroupIcon = group.icon
            const isOpen = openGroups[group.labelKey] || group.items.some(item => isItemActive(item.href))
            const isGroupHovered = hoveredGroup === group.labelKey
            
            return (
              <li 
                key={group.labelKey} 
                className="mb-1"
                onMouseEnter={() => !isCollapsed && setHoveredGroup(group.labelKey)}
                onMouseLeave={() => !isCollapsed && setHoveredGroup(null)}
              >
                {/* Group Header */}
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false)
                      setOpenGroups(prev => ({
                        ...prev,
                        [group.labelKey]: true
                      }))
                    } else {
                      toggleGroup(group.labelKey)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    group.items.some(item => isItemActive(item.href))
                      ? 'bg-[#4a3e3a] text-[#ff8a65]'
                      : 'text-white/90 hover:bg-[#4a3e3a] hover:text-[#ff8a65]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {GroupIcon && <GroupIcon className="w-5 h-5" />}
                    {!isCollapsed && <span className="font-medium">{t(group.labelKey)}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Group Items */}
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
                                  ? 'bg-[#ff8a65] text-white'
                                  : 'text-white/80 hover:bg-[#4a3e3a] hover:text-[#ff8a65]'
                              }`}
                            >
                              {ItemIcon && <ItemIcon className="w-4 h-4" />}
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    isGroupHovered && (
                      <div className="fixed left-20 ml-2 w-48 bg-[#3a2e2a] rounded-lg shadow-lg z-50 py-2 border border-[#4a3e3a]">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon
                          const isActive = isItemActive(item.href)
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-lg transition-colors mx-2 ${
                                isActive
                                  ? 'bg-primary text-white dark:bg-primary'
                                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-textHover dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                              }`}
                            >
                              {ItemIcon && <ItemIcon className="w-4 h-4" />}
                              <span>{t(item.labelKey)}</span>
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

