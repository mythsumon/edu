import { AdminAccountTable } from '../components/AdminAccountTable'
import type { AdminAccount } from '../../model/account-management.types'

// Placeholder data - to be replaced with API data
const mockAdminAccounts: AdminAccount[] = []

export const AdminAccountManagementPage = () => {
  const handleDetailClick = (admin: AdminAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for admin:', admin)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4">Admin Account Management</h1>
        <p className="text-muted-foreground">Manage admin accounts</p>
      </div>
      <AdminAccountTable data={mockAdminAccounts} onDetailClick={handleDetailClick} />
    </div>
  )
}
