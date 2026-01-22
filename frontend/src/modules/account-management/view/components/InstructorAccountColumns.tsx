import * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { cn } from '@/shared/lib/cn'
import type { InstructorAccount } from '../../model/account-management.types'
import { ActionsCell } from './InstructorAccountActionsCell'
import {
  STATUS_INACTIVE,
  STATUS_ACTIVE,
  STATUS_SUSPENDED,
  STATUS_BLOCKED,
  CLASSIFICATION_BASIC,
  CLASSIFICATION_INTERMEDIATE,
  CLASSIFICATION_ADVANCED,
} from '../../constants/account-status'

/**
 * Props for creating instructor account columns
 */
export interface InstructorAccountColumnsProps {
  onDetailClick: (instructor: InstructorAccount) => void
  regionMap?: Map<number, string> // Map of regionId -> region name (codeName)
  classificationMap?: Map<number, string> // Map of classificationId -> classification name (codeName)
  statusMap?: Map<number, string> // Map of statusId -> status name (codeName)
}

/**
 * Creates column definitions for the instructor account table
 */
export const useInstructorAccountColumns = ({
  onDetailClick,
  regionMap,
  classificationMap,
  statusMap,
}: InstructorAccountColumnsProps): ColumnDef<InstructorAccount>[] => {
  const { t } = useTranslation()

  return React.useMemo<ColumnDef<InstructorAccount>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label={t('accountManagement.selectAll')}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`${t('accountManagement.selectRow')} ${row.original.name}`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { width: 50 },
      },
      {
        accessorKey: 'instructorId',
        header: () => (
          <div style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
            {t('accountManagement.instructorId')}
          </div>
        ),
        cell: ({ row }) => {
          const instructorId = row.getValue('instructorId') as string | undefined
          return (
            <div
              className="font-medium"
              style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
            >
              {instructorId || '-'}
            </div>
          )
        },
        meta: { width: 120 },
      },
      {
        accessorKey: 'name',
        header: () => (
          <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
            {t('accountManagement.name')}
          </div>
        ),
        cell: ({ row }) => {
          const name = row.getValue('name') as string | undefined
          return (
            <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
              {name || '-'}
            </div>
          )
        },
        meta: { width: 200 },
      },
      {
        accessorKey: 'username',
        header: () => (
          <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
            {t('accountManagement.username')}
          </div>
        ),
        cell: ({ row }) => {
          const username = row.getValue('username') as string | undefined
          return (
            <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
              {username || '-'}
            </div>
          )
        },
        meta: { width: 150 },
      },
      {
        accessorKey: 'affiliation',
        header: () => (
          <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
            {t('accountManagement.affiliation')}
          </div>
        ),
        cell: ({ row }) => {
          const affiliation = row.getValue('affiliation') as string | undefined
          return (
            <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
              {affiliation || '-'}
            </div>
          )
        },
        meta: { width: 200 },
      },
      {
        accessorKey: 'region',
        header: () => (
          <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
            {t('accountManagement.region')}
          </div>
        ),
        cell: ({ row }) => {
          const instructor = row.original
          const regionName = instructor.regionId && regionMap
            ? regionMap.get(instructor.regionId)
            : undefined
          return (
            <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
              {regionName || '-'}
            </div>
          )
        },
        meta: { width: 150 },
      },
      {
        accessorKey: 'instructorClassification',
        header: () => (
          <div style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}>
            {t('accountManagement.instructorClassification')}
          </div>
        ),
        cell: ({ row }) => {
          const instructor = row.original
          const classificationName = instructor.classificationId && classificationMap
            ? classificationMap.get(instructor.classificationId)
            : undefined

          if (!classificationName) {
            return (
              <div style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}>
                -
              </div>
            )
          }

          // Map classification to pill styles
          const getClassificationStyle = (value: string) => {
            const lowerValue = value.toLowerCase()
            if (lowerValue.includes(CLASSIFICATION_BASIC)) {
              // Basic: light blue background, dark blue text
              return 'bg-blue-100 text-blue-700'
            }
            if (lowerValue.includes(CLASSIFICATION_INTERMEDIATE)) {
              // Intermediate: light amber background, dark amber text
              return 'bg-amber-100 text-amber-700'
            }
            if (lowerValue.includes(CLASSIFICATION_ADVANCED)) {
              // Advanced: light purple background, dark purple text
              return 'bg-purple-100 text-purple-700'
            }
            return 'bg-gray-100 text-gray-700'
          }

          return (
            <div
              style={{ width: '180px', minWidth: '180px', maxWidth: '180px' }}
            >
              <div
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium',
                  getClassificationStyle(classificationName)
                )}
              >
                {classificationName}
              </div>
            </div>
          )
        },
        meta: { width: 180 },
      },
      {
        accessorKey: 'status',
        header: () => (
          <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
            {t('accountManagement.status')}
          </div>
        ),
        cell: ({ row }) => {
          const instructor = row.original
          const statusName = instructor.statusId && statusMap
            ? statusMap.get(instructor.statusId)
            : undefined

          if (!statusName) {
            return (
              <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
                -
              </div>
            )
          }

          // Map status to pill styles
          const getStatusStyle = (value: string) => {
            const lowerValue = value.toLowerCase()
            // Check inactive first since it contains "active"
            if (lowerValue.includes(STATUS_INACTIVE)) {
              // Inactive: light gray background, dark gray text
              return 'bg-gray-100 text-gray-700'
            }
            if (lowerValue.includes(STATUS_ACTIVE)) {
              // Active: light green background, dark green text
              return 'bg-green-100 text-green-700'
            }
            if (lowerValue.includes(STATUS_SUSPENDED)) {
              // Suspended: light amber background, dark amber text
              return 'bg-amber-100 text-amber-700'
            }
            if (lowerValue.includes(STATUS_BLOCKED)) {
              // Blocked: light red background, dark red text
              return 'bg-red-100 text-red-700'
            }
            // Default: light gray background, dark gray text
            return 'bg-gray-100 text-gray-700'
          }

          return (
            <div
              style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}
            >
              <div
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium',
                  getStatusStyle(statusName)
                )}
              >
                {statusName}
              </div>
            </div>
          )
        },
        meta: { width: 150 },
      },
      {
        id: 'actions',
        header: () => (
          <div
            className="text-center"
            style={{ minWidth: '80px', maxWidth: '100px' }}
          >
            {t('accountManagement.particular')}
          </div>
        ),
        cell: ({ row }) => {
          const instructor = row.original
          return (
            <div style={{  minWidth: '80px', maxWidth: '100px' }}>
              <ActionsCell instructor={instructor} onDetailClick={onDetailClick} />
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
        meta: { minWidth: 80, maxWidth: 100 },
      },
    ],
    [t, onDetailClick, regionMap, classificationMap, statusMap]
  )
}
