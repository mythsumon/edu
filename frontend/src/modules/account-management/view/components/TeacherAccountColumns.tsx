import * as React from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import type { TeacherAccount } from '../../model/account-management.types'
import { ActionsCell } from './TeacherAccountActionsCell'

/**
 * Props for creating teacher account columns
 */
export interface TeacherAccountColumnsProps {
  onDetailClick: (teacher: TeacherAccount) => void
}

/**
 * Creates column definitions for the teacher account table
 */
export const useTeacherAccountColumns = ({
  onDetailClick,
}: TeacherAccountColumnsProps): ColumnDef<TeacherAccount>[] => {
  const { t } = useTranslation()

  return React.useMemo<ColumnDef<TeacherAccount>[]>(
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
            {t('accountManagement.teacherId')}
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
        accessorKey: 'email',
        header: () => (
          <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
            {t('accountManagement.email')}
          </div>
        ),
        cell: ({ row }) => {
          const email = row.getValue('email') as string | undefined
          return (
            <div style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}>
              {email || '-'}
            </div>
          )
        },
        meta: { width: 200 },
      },
      {
        accessorKey: 'phoneNumber',
        header: () => (
          <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
            {t('accountManagement.phoneNumber')}
          </div>
        ),
        cell: ({ row }) => {
          const phoneNumber = row.getValue('phoneNumber') as string | undefined
          return (
            <div style={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
              {phoneNumber || '-'}
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
          const teacher = row.original
          return (
            <div style={{ minWidth: '80px', maxWidth: '100px' }}>
              <ActionsCell teacher={teacher} onDetailClick={onDetailClick} />
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
        meta: { minWidth: 80, maxWidth: 100 },
      },
    ],
    [t, onDetailClick]
  )
}
