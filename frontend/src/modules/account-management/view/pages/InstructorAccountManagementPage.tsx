import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Search, Filter } from 'lucide-react'
import type { ColumnPinningState } from '@tanstack/react-table'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card } from '@/shared/ui/card'
import { DataTable } from '@/shared/components/DataTable'
import { CustomPagination } from '@/shared/components/CustomPagination'
import { debounce } from '@/shared/lib/debounce'
import type { InstructorAccount, ListAccountsParams } from '../../model/account-management.types'
import { useInstructorAccountsQuery } from '../../controller/queries'
import { getCommonCodeById } from '@/modules/common-code/model/common-code.service'
import { useMasterCodeChildrenByCodeQuery } from '@/modules/master-code-setup/controller/queries'
import { MASTER_CODE_PARENT_CODES } from '@/shared/constants/master-code'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ROUTES } from '@/shared/constants/routes'
import { useInstructorAccountColumns } from '../components/InstructorAccountColumns'
import {
  InstructorFilterDialog,
  type InstructorFilterData,
} from '../components/InstructorFilterDialog'
import { exportInstructorsToExcel } from '../../model/account-management.service'

/**
 * Table Content Component - Extracted to prevent Card re-renders
 */
interface TableContentProps {
  isLoading: boolean
  error: Error | string | undefined
  instructorAccounts: InstructorAccount[]
  columns: ReturnType<typeof useInstructorAccountColumns>
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
    instructorAccounts,
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
            data={instructorAccounts}
            columns={columns}
            emptyMessage={t('accountManagement.noInstructorAccountsFound')}
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
 * Instructor Account Management Page
 * Displays instructor account management interface
 */
export const InstructorAccountManagementPage = () => {
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
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState<boolean>(false)
  const [filters, setFilters] = React.useState<InstructorFilterData>({})
  const [isExporting, setIsExporting] = React.useState<boolean>(false)

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

  // Helper function to convert string array to number array
  const convertStringArrayToNumbers = React.useCallback(
    (arr: string | string[] | undefined): number[] | undefined => {
      if (!arr) return undefined
      const arrAsArray = Array.isArray(arr) ? arr : [arr]
      if (arrAsArray.length === 0) return undefined
      return arrAsArray.map((id) => Number(id)).filter((id) => !isNaN(id))
    },
    []
  )

  // Create stable filter keys for dependency tracking
  const filtersKey = React.useMemo(() => {
    const regionKey = Array.isArray(filters.region) ? filters.region.join(',') : filters.region || ''
    const classificationKey = Array.isArray(filters.classification) ? filters.classification.join(',') : filters.classification || ''
    const statusKey = Array.isArray(filters.status) ? filters.status.join(',') : filters.status || ''
    const zoneKey = Array.isArray(filters.zone) ? filters.zone.join(',') : filters.zone || ''
    return `r:${regionKey}|c:${classificationKey}|s:${statusKey}|z:${zoneKey}`
  }, [filters])

  // Convert filter values to number arrays
  const filterRegionIds = React.useMemo(
    () => convertStringArrayToNumbers(filters.region),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  )
  const filterClassificationIds = React.useMemo(
    () => convertStringArrayToNumbers(filters.classification),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  )
  const filterStatusIds = React.useMemo(
    () => convertStringArrayToNumbers(filters.status),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  )
  const filterZoneIds = React.useMemo(
    () => convertStringArrayToNumbers(filters.zone),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey]
  )

  // Build query params object with only defined values
  const queryParams = React.useMemo(() => {
    const params: ListAccountsParams = {
      page,
      size,
    }
    
    if (debouncedSearchQuery) {
      params.q = debouncedSearchQuery
    }
    
    if (filterRegionIds && filterRegionIds.length > 0) {
      params.regionIds = filterRegionIds
    }
    
    if (filterClassificationIds && filterClassificationIds.length > 0) {
      params.classificationIds = filterClassificationIds
    }
    
    if (filterStatusIds && filterStatusIds.length > 0) {
      params.statusIds = filterStatusIds
    }
    
    if (filterZoneIds && filterZoneIds.length > 0) {
      params.zoneIds = filterZoneIds
    }
    
    return params
  }, [debouncedSearchQuery, page, size, filterRegionIds, filterClassificationIds, filterStatusIds, filterZoneIds])

  // Fetch instructors using React Query with debounced search, pagination, and filters
  const { data, isLoading, error } = useInstructorAccountsQuery(queryParams)

  const instructorAccounts = React.useMemo(() => data?.items ?? [], [data?.items])

  // Collect unique regionIds from instructor accounts
  const uniqueRegionIds = React.useMemo(() => {
    const regionIds = instructorAccounts
      .map((account) => account.regionId)
      .filter((id): id is number => id !== undefined && id !== null)
    return Array.from(new Set(regionIds))
  }, [instructorAccounts])

  // Collect unique classificationIds from instructor accounts
  const uniqueClassificationIds = React.useMemo(() => {
    const classificationIds = instructorAccounts
      .map((account) => account.classificationId)
      .filter((id): id is number => id !== undefined && id !== null)
    return Array.from(new Set(classificationIds))
  }, [instructorAccounts])

  // Collect unique statusIds from instructor accounts
  const uniqueStatusIds = React.useMemo(() => {
    const statusIds = instructorAccounts
      .map((account) => account.statusId)
      .filter((id): id is number => id !== undefined && id !== null)
    return Array.from(new Set(statusIds))
  }, [instructorAccounts])

  // Fetch all status master codes (fetch once, since there are only a few statuses)
  const { data: statusMasterCodesData } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  )
  const statusMasterCodes = React.useMemo(
    () => statusMasterCodesData?.items || [],
    [statusMasterCodesData?.items]
  )

  // Fetch all regions using useQueries
  const regionQueries = useQueries({
    queries: uniqueRegionIds.map((regionId) => ({
      queryKey: ['common-code', 'by-id', regionId],
      queryFn: () => getCommonCodeById(regionId),
      enabled: regionId !== undefined,
    })),
  })

  // Fetch all classifications using useQueries
  const classificationQueries = useQueries({
    queries: uniqueClassificationIds.map((classificationId) => ({
      queryKey: ['common-code', 'by-id', classificationId],
      queryFn: () => getCommonCodeById(classificationId),
      enabled: classificationId !== undefined,
    })),
  })

  // Extract query data into stable structure - only recompute when data actually changes
  // Create a stable dependency string from actual query data values
  const regionDataKey = React.useMemo(
    () =>
      uniqueRegionIds
        .map((id, idx) => {
          const query = regionQueries[idx]
          return query?.data?.codeName ? `${id}:${query.data.codeName}` : null
        })
        .filter(Boolean)
        .join('|'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniqueRegionIds.join(','), regionQueries.map((q) => q.data?.codeName).join(',')]
  )

  const classificationDataKey = React.useMemo(
    () =>
      uniqueClassificationIds
        .map((id, idx) => {
          const query = classificationQueries[idx]
          return query?.data?.codeName ? `${id}:${query.data.codeName}` : null
        })
        .filter(Boolean)
        .join('|'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      uniqueClassificationIds.join(','),
      classificationQueries.map((q) => q.data?.codeName).join(','),
    ]
  )

  const regionQueryData = React.useMemo(
    () =>
      uniqueRegionIds.map((regionId, index) => ({
        regionId,
        codeName: regionQueries[index]?.data?.codeName,
      })),
    // Only recompute when the actual data values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regionDataKey, uniqueRegionIds.length]
  )

  const classificationQueryData = React.useMemo(
    () =>
      uniqueClassificationIds.map((classificationId, index) => ({
        classificationId,
        codeName: classificationQueries[index]?.data?.codeName,
      })),
    // Only recompute when the actual data values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classificationDataKey, uniqueClassificationIds.length]
  )

  // Create region map: regionId -> codeName
  const regionMap = React.useMemo(() => {
    const map = new Map<number, string>()
    regionQueryData.forEach(({ regionId, codeName }) => {
      if (codeName) {
        map.set(regionId, codeName)
      }
    })
    return map
  }, [regionQueryData])

  // Create classification map: classificationId -> codeName
  const classificationMap = React.useMemo(() => {
    const map = new Map<number, string>()
    classificationQueryData.forEach(({ classificationId, codeName }) => {
      if (codeName) {
        map.set(classificationId, codeName)
      }
    })
    return map
  }, [classificationQueryData])

  // Create status map: statusId -> codeName
  const statusMap = React.useMemo(() => {
    const map = new Map<number, string>()
    statusMasterCodes.forEach((status) => {
      if (status.id && status.codeName) {
        map.set(status.id, status.codeName)
      }
    })
    return map
  }, [statusMasterCodes])

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

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setPage(0)
  }, [debouncedSearchQuery, filters])

  // Handle page change
  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Handle size change
  const handleSizeChange = React.useCallback((newSize: number) => {
    setSize(newSize)
    setPage(0) // Reset to first page when size changes
  }, [])

  const handleFilterClick = React.useCallback(() => {
    setIsFilterDialogOpen(true)
  }, [])

  const handleFilterConfirm = React.useCallback((filterData: InstructorFilterData) => {
    // Always create a new object to ensure state update triggers re-render
    const newFilters: InstructorFilterData = {
      region: filterData.region,
      classification: filterData.classification,
      status: filterData.status,
      zone: filterData.zone,
    }
    setFilters(newFilters)
    setIsFilterDialogOpen(false)
  }, [])

  const handleAddInstructor = React.useCallback(() => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_CREATE_FULL)
  }, [navigate])

  const handleDownload = React.useCallback(async () => {
    try {
      setIsExporting(true)

      // Build export parameters from current filters (excluding pagination)
      const exportParams = {
        q: debouncedSearchQuery || undefined,
        regionIds: filterRegionIds,
        classificationIds: filterClassificationIds,
        statusIds: filterStatusIds,
        zoneIds: filterZoneIds,
      }

      // Call export API
      const blob = await exportInstructorsToExcel(exportParams)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `instructors_${new Date().toISOString().split('T')[0]}.xlsx`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting instructors:', error)
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false)
    }
  }, [debouncedSearchQuery, filterRegionIds, filterClassificationIds, filterStatusIds, filterZoneIds])

  const handleDetailClick = React.useCallback((instructor: InstructorAccount) => {
    navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL}/${instructor.id}`)
  }, [navigate])

  const handleGetHeaderClassName = React.useCallback((headerId: string) => {
    if (headerId === 'actions') return 'text-right'
    return 'text-left'
  }, [])

  const columns = useInstructorAccountColumns({
    onDetailClick: handleDetailClick,
    regionMap,
    classificationMap,
    statusMap,
  })

  // Memoized header component to prevent re-renders
  const PageHeader = React.useMemo(
    () => (
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between">
          {/* Left side: Title and Description */}
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {t('accountManagement.instructorAccountManagement')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('accountManagement.instructorAccountManagementDescription')}
            </p>
          </div>
          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={isExporting}>
              <Download className="h-4 w-4" />
              {t('accountManagement.download')}
            </Button>
            <Button onClick={handleAddInstructor}>
              <Plus className="h-4 w-4" />
              {t('accountManagement.addNewInstructor')}
            </Button>
          </div>
        </div>
      </div>
    ),
    [t, handleDownload, handleAddInstructor, isExporting]
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
        <Button variant="outline" onClick={handleFilterClick}>
          <Filter className="h-4 w-4" />
          {t('common.filter')}
        </Button>
      </div>
    ),
    [t, searchQuery, handleSearchChange, handleFilterClick]
  )

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {PageHeader}
      {/* Content Area with Card */}
      <div className="px-4 py-5">
        <Card>
          {/* Search and Filter Bar */}
          {SearchBar}
          {/* Table - Extracted component prevents Card re-renders */}
          <TableContent
            isLoading={isLoading}
            error={error || undefined}
            instructorAccounts={instructorAccounts}
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
      <InstructorFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onConfirm={handleFilterConfirm}
      />
    </div>
  )
}
