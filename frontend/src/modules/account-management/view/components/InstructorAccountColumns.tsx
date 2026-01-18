import * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { cn } from '@/shared/lib/cn'
import type { InstructorAccount } from '../../model/account-management.types'
import { ActionsCell } from './InstructorAccountActionsCell'

/**
 * Props for creating instructor account columns
 */
export interface InstructorAccountColumnsProps {
  onDetailClick: (instructor: InstructorAccount) => void
  regionMap?: Map<number, string> // Map of regionId -> region name (codeName)
  classificationMap?: Map<number, string> // Map of classificationId -> classification name (codeName)
}

/**
 * Creates column definitions for the instructor account table
 */
export const useInstructorAccountColumns = ({
  onDetailClick,
  regionMap,
  classificationMap,
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
        accessorKey: 'id',
        header: () => (
          <div style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
            {t('accountManagement.instructorId')}
          </div>
        ),
        cell: ({ row }) => {
          const id = row.getValue('id') as number | undefined
          return (
            <div
              className="font-medium"
              style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}
            >
              {id || '-'}
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
            if (lowerValue.includes('common') || lowerValue.includes('일반')) {
              return 'bg-blue-500 text-white'
            }
            if (lowerValue.includes('advanced') || lowerValue.includes('고급')) {
              return 'bg-purple-500 text-white'
            }
            if (lowerValue.includes('preparation') || lowerValue.includes('준비')) {
              return 'bg-yellow-500 text-white'
            }
            return 'bg-gray-500 text-white'
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
    [t, onDetailClick, regionMap, classificationMap]
  )
}
