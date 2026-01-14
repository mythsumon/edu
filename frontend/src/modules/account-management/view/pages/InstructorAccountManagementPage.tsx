import { InstructorAccountTable } from '../components/InstructorAccountTable'
import type { InstructorAccount } from '../../model/account-management.types'
import { useInstructorAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageLayout } from '@/app/layout/PageLayout'
import { ROUTES } from '@/shared/constants/routes'

export const InstructorAccountManagementPage = () => {
  const { data, isLoading, error } = useInstructorAccountsQuery()

  const handleDetailClick = (instructor: InstructorAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for instructor:', instructor)
  }

  const instructorAccounts = data?.items ?? []

  return (
    <PageLayout
      title="Instructor Account Management"
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_DASHBOARD_FULL, label: 'Dashboard' }}
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
