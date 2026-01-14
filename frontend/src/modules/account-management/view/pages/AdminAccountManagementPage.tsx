import { AdminAccountTable } from '../components/AdminAccountTable'
import type { AdminAccount } from '../../model/account-management.types'
import { useAdminAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLayout } from '@/app/layout/PageLayout'
import { ROUTES } from '@/shared/constants/routes'

export const AdminAccountManagementPage = () => {
  const { data, isLoading, error } = useAdminAccountsQuery()

  const handleDetailClick = (admin: AdminAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for admin:', admin)
  }

  const adminAccounts = data?.items ?? []

  return (
    <PageLayout
      title="Admin Account Management"
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_DASHBOARD_FULL, label: 'Dashboard' }}
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
