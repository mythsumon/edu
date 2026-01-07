'use client'

import { Bell, Circle, Globe, Sun, Moon, CheckCircle2, Settings, Eye } from 'lucide-react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Modal, Form, Input, Select } from 'antd'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Breadcrumb } from '@/components/shared/common'

// Admin menu config
const adminMenuConfig = [
  {
    labelKey: 'sidebar.dashboard',
    items: [
      { labelKey: 'sidebar.overallStatus', href: '/admin' },
    ],
  },
  {
    labelKey: 'sidebar.educationOperations',
    items: [
      { labelKey: 'sidebar.educationManagement', href: '/admin/operations' },
      { labelKey: 'sidebar.educationStatusChange', href: '/admin/education-status' },
    ],
  },
  {
    labelKey: 'sidebar.instructorAssignment',
    items: [
      { labelKey: 'sidebar.instructorApplication', href: '/admin/instructor-assignment/applications' },
      { labelKey: 'sidebar.instructorAllocation', href: '/admin/instructor-assignment/manual' },
      { labelKey: 'sidebar.teachingConfirmation', href: '/admin/instructor-assignment/confirmations' },
    ],
  },
  {
    labelKey: 'sidebar.referenceInfo',
    items: [
      { labelKey: 'sidebar.institution', href: '/admin/institution' },
      { labelKey: 'sidebar.program', href: '/admin/program' },
      { labelKey: 'sidebar.instructor', href: '/admin/instructor' },
    ],
  },
  {
    labelKey: 'sidebar.systemManagement',
    items: [
      { labelKey: 'sidebar.settings', href: '/admin/system' },
    ],
  },
]

// Instructor menu config
const instructorMenuConfig = [
  {
    labelKey: 'sidebar.dashboard',
    items: [
      { labelKey: 'sidebar.myDashboard', href: '/instructor/dashboard' },
    ],
  },
  {
    labelKey: 'sidebar.educationManagement',
    items: [
      { labelKey: 'sidebar.educationApplication', href: '/instructor/application' },
      { labelKey: 'sidebar.educationAssignment', href: '/instructor/assignment' },
      { labelKey: 'sidebar.teachingConfirmation', href: '/instructor/confirmation' },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // Get current page title based on pathname
  const getPageTitle = () => {
    // Check admin menu
    for (const group of adminMenuConfig) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return t(item.labelKey)
        }
      }
    }
    
    // Check instructor menu
    for (const group of instructorMenuConfig) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return t(item.labelKey)
        }
      }
    }
    
    // Default title
    return t('header.title')
  }

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '신규 강사 신청',
      description: '홍길동 강사가 강사 신청서를 제출했습니다.',
      time: '5분 전',
      read: false,
    },
    {
      id: 2,
      title: '교육 일정 변경',
      description: '12차시 블록코딩 교육의 일정이 수정되었습니다.',
      time: '1시간 전',
      read: false,
    },
    {
      id: 3,
      title: '시스템 알림',
      description: '일부 데이터가 업데이트되었습니다.',
      time: '어제',
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const toggleLanguage = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko')
  }

  const isInstructor = pathname?.startsWith('/instructor')
  const pageTitle = getPageTitle()
  
  return (
    <header className={`h-auto sm:h-14 md:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-6 py-2 sm:py-0 relative z-20 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 gap-2 sm:gap-0 transition-colors`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto">
        <Breadcrumb className="mb-0 text-xs sm:text-sm" />
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Language toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        >
          {locale === 'ko' ? 'KO' : 'EN'}
          <Globe className="w-4 h-4" />
        </button>

        {/* Notification dropdown */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev)
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-semibold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] md:w-96 max-w-[400px] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden border border-slate-100">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-800 rounded-lg">
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-base font-bold text-slate-900">{t('header.notifications')}</div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {locale === 'ko' 
                    ? '최근 시스템 및 신청 관련 알림입니다.' 
                    : 'Recent system and application related notifications.'}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50/80 transition-all duration-200 border-b border-slate-50 last:border-b-0 group ${
                      !item.read ? 'bg-blue-50/30' : 'bg-white'
                    }`}
                    onClick={() => {
                      setNotifications(notifications.map(n => 
                        n.id === item.id ? { ...n, read: true } : n
                      ))
                    }}
                  >
                    {/* Status Indicator */}
                    <div className="mt-1 flex-shrink-0">
                      {item.read ? (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      ) : (
                        <div className="relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping opacity-75" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold mb-1 line-clamp-1 ${
                        !item.read ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                        {!item.read && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                            새 알림
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Read Indicator */}
                    {!item.read && (
                      <div className="mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </button>
                ))}
                {notifications.length === 0 && (
                  <div className="px-5 py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {locale === 'ko' ? '새로운 알림이 없습니다.' : 'No new notifications.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                  <span>{locale === 'ko' ? '알림 설정' : 'Notification Settings'}</span>
                </button>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
                    >
                      {locale === 'ko' ? '모두 읽음' : 'Mark all as read'}
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-100">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{locale === 'ko' ? '전체 보기' : 'View all'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  )
}