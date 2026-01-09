import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/shared/stores/ui.store'
import { useAuthStore } from '@/shared/stores/auth.store'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  Menu,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileStack,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface MenuItem {
  nameKey: string
  href: string
  icon: typeof LayoutDashboard
  subItems?: { nameKey: string; href: string }[]
}

export const Sidebar = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUiStore()
  const { user } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['sidebar.dashboard'])
  const [isHovered, setIsHovered] = useState(false)

  const navigation: MenuItem[] = useMemo(() => [
    {
      nameKey: 'sidebar.dashboard',
      href: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      subItems: [
        { nameKey: 'sidebar.overallProgramStatus', href: ROUTES.DASHBOARD },
      ],
    },
    {
      nameKey: 'sidebar.educationOperations',
      href: ROUTES.EDUCATION_OPERATIONS,
      icon: BookOpen,
    },
    {
      nameKey: 'sidebar.instructorAssignment',
      href: ROUTES.INSTRUCTOR_ASSIGNMENT,
      icon: GraduationCap,
      subItems: [
        { nameKey: 'sidebar.instructorApplicationManagement', href: ROUTES.INSTRUCTOR_APPLICATION_MANAGEMENT },
        { nameKey: 'sidebar.instructorAllocationManagement', href: ROUTES.INSTRUCTOR_ALLOCATION_MANAGEMENT },
        { nameKey: 'sidebar.teachingConfirmationManagement', href: ROUTES.TEACHING_CONFIRMATION_MANAGEMENT },
      ],
    },
    {
      nameKey: 'sidebar.referenceInformationManagement',
      href: ROUTES.REFERENCE_INFORMATION_MANAGEMENT,
      icon: FileStack,
      subItems: [
        { nameKey: 'sidebar.institutionManagement', href: ROUTES.INSTITUTION_MANAGEMENT },
        { nameKey: 'sidebar.programManagement', href: ROUTES.PROGRAM_MANAGEMENT },
        { nameKey: 'sidebar.instructorManagement', href: ROUTES.INSTRUCTOR_MANAGEMENT },
      ],
    },
    {
      nameKey: 'sidebar.systemManagement',
      href: ROUTES.SYSTEM_MANAGEMENT,
      icon: Settings,
      subItems: [
        { nameKey: 'sidebar.settingsAndUserManagement', href: ROUTES.SETTINGS_AND_USER_MANAGEMENT },
      ],
    },
  ], [])

  // Determine if sidebar should appear expanded (either manually expanded or hovered)
  const isExpanded = !sidebarCollapsed || isHovered

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemExpanded = (itemNameKey: string) => expandedItems.includes(itemNameKey)

  const isActiveRoute = (href: string) => location.pathname === href

  // Handle menu item click - expand sidebar
  const handleMenuItemClick = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false)
    }
  }

  // Handle hover enter - expand sidebar
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  // Handle hover leave - collapse sidebar if it was only expanded by hover
  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return user.name.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <aside
      className={cn(
        'border-r bg-background transition-all duration-300 flex flex-col h-screen overflow-hidden',
        isExpanded ? 'w-64 min-w-64 max-w-64' : 'w-16 min-w-16 max-w-16'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b flex items-center px-4">
        <div className={cn(
          'flex items-center w-full',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {isExpanded && (
            <h1 className="font-bold text-base text-foreground truncate whitespace-nowrap flex-1 min-w-0">
              {t('sidebar.educationManagementSystem')}
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={cn(
        'flex-1 overflow-y-auto',
        isExpanded ? 'p-4' : 'p-2'
      )}>
        <TooltipProvider delayDuration={0}>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0
              const isItemExpandedState = isItemExpanded(item.nameKey)
              const isActive = isActiveRoute(item.href) ||
                (hasSubItems && item.subItems?.some((sub) => isActiveRoute(sub.href)))
              const itemName = t(item.nameKey)

              if (!isExpanded) {
                // Collapsed view: show only icons + tooltip (right)
                return (
                  <li key={item.nameKey}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          onClick={handleMenuItemClick}
                          className={cn(
                            'flex items-center justify-center p-3 rounded-md transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center">
                        {itemName}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              }

              // Expanded view: show full menu
              return (
                <li key={item.nameKey} className="mb-2">
                  {hasSubItems ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              toggleExpand(item.nameKey)
                              handleMenuItemClick()
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-accent'
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="text-sm font-medium truncate whitespace-nowrap">{itemName}</span>
                            </div>
                            {isItemExpandedState ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {itemName}
                        </TooltipContent>
                      </Tooltip>
                      {isItemExpandedState && item.subItems && (
                        <ul className="ml-8 mt-2 space-y-2">
                          {item.subItems.map((subItem) => {
                            const isSubActive = isActiveRoute(subItem.href)
                            const subItemName = t(subItem.nameKey)
                            return (
                              <li key={subItem.nameKey}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      to={subItem.href}
                                      onClick={handleMenuItemClick}
                                      className={cn(
                                        'block px-3 py-2 rounded-md text-sm transition-colors truncate whitespace-nowrap',
                                        isSubActive
                                          ? 'bg-primary text-primary-foreground font-medium'
                                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                      )}
                                    >
                                      {subItemName}
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="center">
                                    {subItemName}
                                  </TooltipContent>
                                </Tooltip>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.href}
                          onClick={handleMenuItemClick}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-md transition-colors min-w-0',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium truncate whitespace-nowrap flex-1">{itemName}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center">
                        {itemName}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </li>
              )
            })}
          </ul>
        </TooltipProvider>
      </nav>

      {/* User Profile Section */}
      <div className={cn(
        'border-t p-4',
        isExpanded ? '' : 'px-2'
      )}>
        {!isExpanded ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {getUserInitials()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary-foreground">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name || t('sidebar.administrator')}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Gyeonggi Future Chim...
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        )}
      </div>
    </aside>
  )
}
