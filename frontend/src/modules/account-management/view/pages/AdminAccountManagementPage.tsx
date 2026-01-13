import { AdminAccountTable } from '../components/AdminAccountTable'
import type { AdminAccount } from '../../model/account-management.types'

// Placeholder data - to be replaced with API data
const mockAdminAccounts: AdminAccount[] = [
  {
    id: 1,
    name: 'John Smith',
    username: 'john.smith',
    email: 'john.smith@example.com',
    phoneNumber: '+1-555-0101',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    username: 'sarah.j',
    email: 'sarah.j@example.com',
    phoneNumber: '+1-555-0102',
  },
  {
    id: 3,
    name: 'Michael Chen',
    username: 'michael.chen',
    email: 'michael.chen@example.com',
    phoneNumber: '+1-555-0103',
  },
  {
    id: 4,
    name: 'Emily Davis',
    username: 'emily.davis',
    email: 'emily.davis@example.com',
    phoneNumber: '+1-555-0104',
  },
  {
    id: 5,
    name: 'David Wilson',
    username: 'david.w',
    email: 'david.w@example.com',
    phoneNumber: '+1-555-0105',
  },
]

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
