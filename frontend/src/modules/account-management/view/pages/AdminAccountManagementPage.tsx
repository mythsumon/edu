import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { AdminAccountTable } from '../components/AdminAccountTable'
import type { AdminAccount } from '../../model/account-management.types'
import { useAdminAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { ROUTES } from '@/shared/constants/routes'

export const AdminAccountManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, error } = useAdminAccountsQuery()

  const handleDetailClick = (admin: AdminAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for admin:', admin)
  }

  const handleAddClick = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_CREATE_FULL)
  }

  const adminAccounts = data?.items ?? []

  return (
    <PageLayout
      title={t('accountManagement.adminAccountManagement')}
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_DASHBOARD_FULL, label: t('accountManagement.dashboard') }}
      actions={
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          {t('accountManagement.newAdmin')}
        </Button>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <AdminAccountTable data={adminAccounts} onDetailClick={handleDetailClick} />
      )}
    </PageLayout>
  )
}
