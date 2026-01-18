// Export public API for account-management module
export { AdminAccountManagementPage } from './view/pages/AdminAccountManagementPage'
export { AddAdminPage } from './view/pages/CreateAdminPage'
export { InstructorAccountManagementPage } from './view/pages/InstructorAccountManagementPage'
export { AddInstructorPage } from './view/pages/CreateInstructorPage'
export { InstructorDetailPage } from './view/pages/InstructorDetailPage'
export { useAdminAccountsQuery, useInstructorAccountsQuery, useInstructorDetailQuery } from './controller/queries'
export type { AdminAccount, InstructorAccount, InstructorDetail } from './model/account-management.types'