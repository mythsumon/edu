import * as React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable'
import type { InstructorAccount } from '../../model/account-management.types'

interface InstructorAccountTableProps {
  data: InstructorAccount[]
  onDetailClick?: (instructor: InstructorAccount) => void
}

export const InstructorAccountTable = ({
  data,
  onDetailClick,
}: InstructorAccountTableProps) => {
  const columns = React.useMemo<ColumnDef<InstructorAccount>[]>(
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
        header: 'Instructor ID',
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
        accessorKey: 'region',
        header: 'Region',
        cell: ({ row }) => {
          const region = row.getValue('region') as string | undefined
          return <div>{region || '-'}</div>
        },
      },
      {
        accessorKey: 'instructorClassification',
        header: 'Instructor Classification',
        cell: ({ row }) => {
          const classification = row.getValue('instructorClassification') as string | undefined
          return <div>{classification || '-'}</div>
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
      emptyMessage="No instructor accounts found."
      enableRowSelection={true}
    />
  )
}
