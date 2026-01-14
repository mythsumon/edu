import { AdminAccountTable } from '../components/AdminAccountTable'
import type { AdminAccount } from '../../model/account-management.types'
import { useAdminAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'

export const AdminAccountManagementPage = () => {
  const { data, isLoading, error } = useAdminAccountsQuery()

  const handleDetailClick = (admin: AdminAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for admin:', admin)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  const adminAccounts = data?.items ?? []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4">Admin Account Management</h1>
        <p className="text-muted-foreground">Manage admin accounts</p>
      </div>
      <AdminAccountTable data={adminAccounts} onDetailClick={handleDetailClick} />
    </div>
  )
}
