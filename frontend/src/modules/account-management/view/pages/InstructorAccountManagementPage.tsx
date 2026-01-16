import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Search, Filter } from 'lucide-react'
import type { ColumnPinningState } from '@tanstack/react-table'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { DataTable } from '@/shared/components/DataTable'
import { cn } from '@/shared/lib/cn'
import type { InstructorAccount } from '../../model/account-management.types'
import { useInstructorAccountsQuery } from '../../controller/queries'
import { getCommonCodeById } from '@/modules/common-code/model/common-code.service'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { ROUTES } from '@/shared/constants/routes'
import { useInstructorAccountColumns } from '../components/InstructorAccountColumns'

/**
 * Instructor Account Management Page
 * Displays instructor account management interface
 */
export const InstructorAccountManagementPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, error } = useInstructorAccountsQuery()
  const [selectedRowId, setSelectedRowId] = React.useState<number | null>(null)

  // Column pinning state - pin select column to left and actions column to right
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select'],
    right: ['actions'],
  })

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState<string>('')

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

  // Create region map: regionId -> codeName
  const regionMap = React.useMemo(() => {
    const map = new Map<number, string>()
    regionQueries.forEach((query) => {
      if (query.data) {
        // Find the corresponding regionId for this query result
        const index = regionQueries.indexOf(query)
        const regionId = uniqueRegionIds[index]
        if (regionId && query.data.codeName) {
          map.set(regionId, query.data.codeName)
        }
      }
    })
    return map
  }, [regionQueries, uniqueRegionIds])

  // Create classification map: classificationId -> codeName
  const classificationMap = React.useMemo(() => {
    const map = new Map<number, string>()
    classificationQueries.forEach((query) => {
      if (query.data) {
        // Find the corresponding classificationId for this query result
        const index = classificationQueries.indexOf(query)
        const classificationId = uniqueClassificationIds[index]
        if (classificationId && query.data.codeName) {
          map.set(classificationId, query.data.codeName)
        }
      }
    })
    return map
  }, [classificationQueries, uniqueClassificationIds])

  const handleFilterClick = () => {
    // TODO: Implement filter functionality
    console.log('Filter clicked')
  }

  const handleAddInstructor = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_CREATE_FULL)
  }

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download clicked')
  }

  const handleDetailClick = (instructor: InstructorAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for instructor:', instructor)
  }

  const columns = useInstructorAccountColumns({
    onDetailClick: handleDetailClick,
    regionMap,
    classificationMap,
  })

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {/* Header with Title and Description */}
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
            <Button variant="outline" onClick={handleDownload}>
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
      {/* Content Area with Card */}
      <div className="px-4 py-5">
        <div
          className={cn(
            'flex w-full flex-col rounded-2xl border border-border/20 bg-card shadow-sm px-4 py-6 space-y-4'
          )}
        >
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t('accountManagement.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline" onClick={handleFilterClick}>
              <Filter className="h-4 w-4" />
              {t('common.filter')}
            </Button>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <DataTable
              data={instructorAccounts}
              columns={columns}
              emptyMessage={t('accountManagement.noInstructorAccountsFound')}
              getHeaderClassName={(headerId) => {
                if (headerId === 'actions') return 'text-right'
                return 'text-left'
              }}
              onRowClick={(row) => {
                setSelectedRowId(row.id)
              }}
              selectedRowId={selectedRowId}
              enableRowSelection={true}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
