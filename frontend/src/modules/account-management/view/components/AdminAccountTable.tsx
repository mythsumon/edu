import * as React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { MoreHorizontal } from 'lucide-react'
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
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'id',
        header: 'Admin ID',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('id')}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'username',
        header: 'Username',
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
          const email = row.getValue('email') as string | undefined
          return <div>{email || '-'}</div>
        },
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone Number',
        cell: ({ row }) => {
          const phoneNumber = row.getValue('phoneNumber') as string | undefined
          return <div>{phoneNumber || '-'}</div>
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDetailClick?.(row.original)}
            aria-label="View details"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onDetailClick]
  )

  return (
    <DataTable
      data={data}
      columns={columns}
      emptyMessage="No admin accounts found."
      enableRowSelection={true}
    />
  )
}
