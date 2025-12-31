'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'

// Import admin menu config from AdminSidebar
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

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className = '' }: BreadcrumbProps = {}) {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Find current item and its parent group
  let currentItem: { labelKey: string; href: string } | null = null
  let parentGroup: { labelKey: string } | null = null

  // Check admin menu
  for (const group of adminMenuConfig) {
    for (const item of group.items) {
      if (item.href === pathname) {
        currentItem = item
        parentGroup = group
        break
      }
    }
    if (currentItem) break
  }

  // Check instructor menu if not found in admin menu
  if (!currentItem) {
    for (const group of instructorMenuConfig) {
      for (const item of group.items) {
        if (item.href === pathname) {
          currentItem = item
          parentGroup = group
          break
        }
      }
      if (currentItem) break
    }
  }

  if (!currentItem || !parentGroup) {
    return null
  }

  // Handle dynamic routes (attendance, activity, equipment detail pages)
  const isDetailPage = pathname?.match(/\/admin\/(attendance|activity|equipment)\/\[id\]/) || 
                       pathname?.match(/\/admin\/(attendance|activity|equipment)\/\d+/)
  
  let detailPageType: string | null = null
  if (pathname?.includes('/attendance/')) {
    detailPageType = 'attendance'
  } else if (pathname?.includes('/activity/')) {
    detailPageType = 'activity'
  } else if (pathname?.includes('/equipment/')) {
    detailPageType = 'equipment'
  }

  // For detail pages, show operations as parent
  if (isDetailPage && detailPageType) {
    const operationsGroup = adminMenuConfig.find(g => g.labelKey === 'sidebar.educationOperations')
    let detailLabel = ''
    
    if (detailPageType === 'attendance') {
      detailLabel = '교육 출석부'
    } else if (detailPageType === 'activity') {
      detailLabel = '교육 활동 일지'
    } else if (detailPageType === 'equipment') {
      detailLabel = '교구 확인서'
    }

    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 text-gray-500 flex-wrap ${className}`}>
        <span className="whitespace-nowrap">{t('sidebar.home') || '홈'}</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        {operationsGroup && (
          <>
            <span className="whitespace-nowrap">{t(operationsGroup.labelKey)}</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          </>
        )}
        <span className="text-gray-900 font-medium whitespace-nowrap">{detailLabel}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 text-gray-500 flex-wrap ${className}`}>
      <span className="whitespace-nowrap">{t('sidebar.home') || '홈'}</span>
      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{t(parentGroup.labelKey)}</span>
      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
      <span className="text-gray-900 font-medium whitespace-nowrap">{t(currentItem.labelKey)}</span>
    </div>
  )
}
