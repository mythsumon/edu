'use client'

import { Bell, Circle, Globe, Sun, Moon } from 'lucide-react'
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
  
  return (
    <header className={`h-16 flex items-center justify-between px-6 relative z-20 bg-white border-b border-slate-200`}>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">
          {getPageTitle()}
        </h1>
        {!isInstructor && <Breadcrumb className="mb-0" />}
      </div>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
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
          className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t('header.notifications')}</div>
                  <div className="text-xs text-slate-500">
                    {locale === 'ko' 
                      ? '최근 시스템 및 신청 관련 알림입니다.' 
                      : 'Recent system and application related notifications.'}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                    {locale === 'ko' 
                      ? `새 알림 ${unreadCount}건` 
                      : `${unreadCount} new notifications`}
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                      !item.read ? 'bg-red-50/40' : ''
                    }`}
                    onClick={() => {
                      setNotifications(notifications.map(n => 
                        n.id === item.id ? { ...n, read: true } : n
                      ))
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item.read ? (
                        <Circle className="w-3 h-3 text-slate-300" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium line-clamp-1 ${
                        !item.read ? 'text-slate-900' : 'text-slate-600'
                      }`}>{item.title}</div>
                      <div className="mt-0.5 text-xs text-slate-500 line-clamp-2">{item.description}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{item.time}</div>
                    </div>
                  </button>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    {locale === 'ko' ? '새로운 알림이 없습니다.' : 'No new notifications.'}
                  </div>
                )}
              </div>
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button className="text-xs text-slate-500 hover:text-slate-700">
                  {locale === 'ko' ? '알림 설정' : 'Notification Settings'}
                </button>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {locale === 'ko' ? '모두 읽음' : 'Mark all as read'}
                    </button>
                  )}
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    {locale === 'ko' ? '전체 알림 보기' : 'View all notifications'}
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