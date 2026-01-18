import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import type { InstructorAccount } from '../../model/account-management.types'
import { Button } from '@/shared/ui/button'

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  instructor: InstructorAccount
  onDetailClick: (instructor: InstructorAccount) => void
}

export const ActionsCell = ({ instructor, onDetailClick }: ActionsCellProps) => {
  const { t } = useTranslation()

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDetailClick(instructor)
  }

  return (
    <div className="w-full flex justify-center">
      <Button variant="outline" size="sm" onClick={handleDetailClick} className="gap-2">
        <Eye className="h-4 w-4" />
        {t('accountManagement.particular')}
      </Button>
    </div>
  )
}
