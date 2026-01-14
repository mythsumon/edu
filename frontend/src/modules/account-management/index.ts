// Export public API for account-management module
export { AdminAccountManagementPage } from './view/pages/AdminAccountManagementPage'
export { InstructorAccountManagementPage } from './view/pages/InstructorAccountManagementPage'
export { useAdminAccountsQuery, useInstructorAccountsQuery } from './controller/queries'
export type { AdminAccount, InstructorAccount } from './model/account-management.types'