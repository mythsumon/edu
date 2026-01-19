import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import type { ColumnPinningState } from '@tanstack/react-table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card } from '@/shared/ui/card'
import { DataTable } from '@/shared/components/DataTable'
import { CustomPagination } from '@/shared/components/CustomPagination'
import { debounce } from '@/shared/lib/debounce'
import type { AdminAccount, ListAccountsParams } from '../../model/account-management.types'
import { useAdminAccountsQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ROUTES } from '@/shared/constants/routes'
import { useAdminAccountColumns } from '../components/AdminAccountColumns'

/**
 * Table Content Component - Extracted to prevent Card re-renders
 */
interface TableContentProps {
  isLoading: boolean
  error: Error | string | undefined
  adminAccounts: AdminAccount[]
  columns: ReturnType<typeof useAdminAccountColumns>
  handleGetHeaderClassName: (headerId: string) => string
  columnPinning: ColumnPinningState
  onColumnPinningChange: React.Dispatch<React.SetStateAction<ColumnPinningState>>
  paginationData: {
    total: number
    page: number
    size: number
    totalPages: number
  }
  handlePageChange: (newPage: number) => void
  handleSizeChange: (newSize: number) => void
}

const TableContent = React.memo<TableContentProps>(
  ({
    isLoading,
    error,
    adminAccounts,
    columns,
    handleGetHeaderClassName,
    columnPinning,
    onColumnPinningChange,
    paginationData,
    handlePageChange,
    handleSizeChange,
  }) => {
    const { t } = useTranslation()

    if (isLoading) {
      return <LoadingState />
    }

    if (error) {
      return <ErrorState error={error} />
    }

    return (
      <>
        <div className="overflow-x-auto">
          <DataTable
            data={adminAccounts}
            columns={columns}
            emptyMessage={t('accountManagement.noAdminAccountsFound')}
            getHeaderClassName={handleGetHeaderClassName}
            enableRowSelection={true}
            enableColumnPinning={true}
            columnPinning={columnPinning}
            onColumnPinningChange={onColumnPinningChange}
          />
        </div>
        <CustomPagination
          total={paginationData.total}
          page={paginationData.page}
          size={paginationData.size}
          totalPages={paginationData.totalPages}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
        />
      </>
    )
  }
)

TableContent.displayName = 'TableContent'

/**
 * Admin Account Management Page
 * Displays admin account management interface
 */
export const AdminAccountManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Column pinning state - pin select column to left and actions column to right
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select'],
    right: ['actions'],
  })

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<string>('')
  const [page, setPage] = React.useState<number>(0)
  const [size, setSize] = React.useState<number>(20)

  // Debounce search query
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string
        setDebouncedSearchQuery(value)
      }, 500),
    []
  )

  // Handle search input change
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    debouncedSetSearch(value)
  }, [debouncedSetSearch])

  // Build query params object with only defined values
  const queryParams = React.useMemo(() => {
    const params: ListAccountsParams = {
      page,
      size,
    }
    
    if (debouncedSearchQuery) {
      params.q = debouncedSearchQuery
    }
    
    return params
  }, [debouncedSearchQuery, page, size])

  // Fetch admins using React Query with debounced search and pagination
  const { data, isLoading, error } = useAdminAccountsQuery(queryParams)

  const adminAccounts = React.useMemo(() => data?.items ?? [], [data?.items])

  // Extract pagination metadata
  const paginationData = React.useMemo(() => {
    if (!data) {
      return {
        total: 0,
        page: 0,
        size: size,
        totalPages: 0,
      }
    }
    return {
      total: data.total,
      page: data.page,
      size: data.size,
      totalPages: data.totalPages,
    }
  }, [data, size])

  // Reset to first page when search changes
  React.useEffect(() => {
    setPage(0)
  }, [debouncedSearchQuery])

  // Handle page change
  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Handle size change
  const handleSizeChange = React.useCallback((newSize: number) => {
    setSize(newSize)
    setPage(0) // Reset to first page when size changes
  }, [])

  const handleAddAdmin = React.useCallback(() => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_CREATE_FULL)
  }, [navigate])

  const handleDetailClick = React.useCallback((admin: AdminAccount) => {
    navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL}/${admin.id}`)
  }, [navigate])

  const handleGetHeaderClassName = React.useCallback((headerId: string) => {
    if (headerId === 'actions') return 'text-right'
    return 'text-left'
  }, [])

  const columns = useAdminAccountColumns({
    onDetailClick: handleDetailClick,
  })

  // Memoized header component to prevent re-renders
  const PageHeader = React.useMemo(
    () => (
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between">
          {/* Left side: Title and Description */}
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {t('accountManagement.adminAccountManagement')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('accountManagement.adminAccountManagementDescription')}
            </p>
          </div>
          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={handleAddAdmin}>
              <Plus className="h-4 w-4" />
              {t('accountManagement.newAdmin')}
            </Button>
          </div>
        </div>
      </div>
    ),
    [t, handleAddAdmin]
  )

  // Memoized search bar component - stable across re-renders
  const SearchBar = React.useMemo(
    () => (
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder={t('accountManagement.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>
    ),
    [t, searchQuery, handleSearchChange]
  )

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {PageHeader}
      {/* Content Area with Card */}
      <div className="px-4 py-5">
        <Card>
          {/* Search Bar */}
          {SearchBar}
          {/* Table - Extracted component prevents Card re-renders */}
          <TableContent
            isLoading={isLoading}
            error={error || undefined}
            adminAccounts={adminAccounts}
            columns={columns}
            handleGetHeaderClassName={handleGetHeaderClassName}
            columnPinning={columnPinning}
            onColumnPinningChange={setColumnPinning}
            paginationData={paginationData}
            handlePageChange={handlePageChange}
            handleSizeChange={handleSizeChange}
          />
        </Card>
      </div>
    </div>
  )
}
