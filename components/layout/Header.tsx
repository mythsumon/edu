'use client'

import { Globe, Sun, Moon } from 'lucide-react'
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
    labelKey: 'sidebar.equipmentManagement',
    items: [
      { labelKey: 'sidebar.equipmentWishlist', href: '/admin/equipment-confirmations/wishlist' },
      { labelKey: 'sidebar.equipmentInventory', href: '/admin/teaching-aids/inventory' },
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

      </div>

    </header>
  )
}