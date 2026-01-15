import * as React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  
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
        header: t('accountManagement.instructorId'),
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
        accessorKey: 'region',
        header: t('accountManagement.region'),
        cell: ({ row }) => {
          const region = row.getValue('region') as string | undefined
          return <div>{region || '-'}</div>
        },
      },
      {
        accessorKey: 'instructorClassification',
        header: t('accountManagement.instructorClassification'),
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
            aria-label={t('accountManagement.viewDetails')}
          >
            <MoreHorizontal className="h-4 w-4" />
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
      emptyMessage={t('accountManagement.noInstructorAccountsFound')}
      enableRowSelection={true}
    />
  )
}
