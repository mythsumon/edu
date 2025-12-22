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
      { labelKey: 'sidebar.systemSettings', href: '/admin/system/settings' },
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

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
      <span>{t('sidebar.home') || '홈'}</span>
      <ChevronRight className="w-4 h-4" />
      <span>{t(parentGroup.labelKey)}</span>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 font-medium">{t(currentItem.labelKey)}</span>
    </div>
  )
}
