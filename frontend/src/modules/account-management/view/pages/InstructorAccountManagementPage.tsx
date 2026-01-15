import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { InstructorAccountTable } from '../components/InstructorAccountTable'
import type { InstructorAccount } from '../../model/account-management.types'
import { useInstructorAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { ROUTES } from '@/shared/constants/routes'

export const InstructorAccountManagementPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useInstructorAccountsQuery()

  const handleDetailClick = (instructor: InstructorAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for instructor:', instructor)
  }

  const handleAddClick = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_ADD_FULL)
  }

  const instructorAccounts = data?.items ?? []

  return (
    <PageLayout
      title="Instructor Account Management"
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_DASHBOARD_FULL, label: 'Dashboard' }}
      actions={
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          New Instructor
        </Button>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <InstructorAccountTable data={instructorAccounts} onDetailClick={handleDetailClick} />
      )}
    </PageLayout>
  )
}
