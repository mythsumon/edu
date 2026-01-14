import { InstructorAccountTable } from '../components/InstructorAccountTable'
import type { InstructorAccount } from '../../model/account-management.types'
import { useInstructorAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'

export const InstructorAccountManagementPage = () => {
  const { data, isLoading, error } = useInstructorAccountsQuery()

  const handleDetailClick = (instructor: InstructorAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for instructor:', instructor)
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  const instructorAccounts = data?.items ?? []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4">Instructor Account Management</h1>
        <p className="text-muted-foreground">Manage instructor accounts</p>
      </div>
      <InstructorAccountTable data={instructorAccounts} onDetailClick={handleDetailClick} />
    </div>
  )
}
