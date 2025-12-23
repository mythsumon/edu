'use client'

import { usePathname } from 'next/navigation'
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

export function PageTitle() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Find current item
  let currentItem: { labelKey: string; href: string } | null = null

  for (const group of adminMenuConfig) {
    for (const item of group.items) {
      if (item.href === pathname) {
        currentItem = item
        break
      }
    }
    if (currentItem) break
  }

  if (!currentItem) {
    return null
  }

  return (
    <h1 className="text-2xl font-bold text-[#3a2e2a]">
      {t(currentItem.labelKey)}
    </h1>
  )
}
