import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import type { AdminAccount } from '../../model/account-management.types'
import { Button } from '@/shared/ui/button'

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  admin: AdminAccount
  onDetailClick: (admin: AdminAccount) => void
}

export const ActionsCell = ({ admin, onDetailClick }: ActionsCellProps) => {
  const { t } = useTranslation()

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDetailClick(admin)
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
