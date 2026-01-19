import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { Eye } from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable'
import type { AdminAccount } from '../../model/account-management.types'

interface AdminAccountTableProps {
  data: AdminAccount[]
  onDetailClick?: (admin: AdminAccount) => void
}

export const AdminAccountTable = ({
  data,
  onDetailClick,
}: AdminAccountTableProps) => {
  const { t } = useTranslation()
  
  const columns = React.useMemo<ColumnDef<AdminAccount>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('accountManagement.selectAll')}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`${t('accountManagement.selectRow')} ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'id',
        header: t('accountManagement.adminId'),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: t('accountManagement.name'),
      },
      {
        accessorKey: 'username',
        header: t('accountManagement.username'),
      },
      {
        accessorKey: 'email',
        header: t('accountManagement.email'),
        cell: ({ row }) => {
          const email = row.getValue('email') as string | undefined
          return <div>{email || '-'}</div>
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: t('accountManagement.phoneNumber'),
        cell: ({ row }) => {
          const phoneNumber = row.getValue('phoneNumber') as string | undefined
          return <div>{phoneNumber || '-'}</div>
        },
      },
      {
        id: 'actions',
        header: t('accountManagement.particular'),
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDetailClick?.(row.original)}
            className="gap-2"
            aria-label={t('accountManagement.viewDetails')}
          >
            <Eye className="h-4 w-4" />
            {t('accountManagement.particular')}
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onDetailClick, t]
  )

  return (
    <DataTable
      data={data}
      columns={columns}
      emptyMessage={t('accountManagement.noAdminAccountsFound')}
      enableRowSelection={true}
    />
  )
}
