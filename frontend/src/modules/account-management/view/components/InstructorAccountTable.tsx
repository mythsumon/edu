import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { Eye } from 'lucide-react'
import { DataTable } from '@/shared/components/DataTable'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/cn'
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
          if (!classification) return <div>-</div>
          
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
              className={cn(
                'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium',
                getClassificationStyle(classification)
              )}
            >
              {classification}
            </div>
          )
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
    <Card>
      <CardContent className="p-0">
        <DataTable
          data={data}
          columns={columns}
          emptyMessage={t('accountManagement.noInstructorAccountsFound')}
          enableRowSelection={true}
        />
      </CardContent>
    </Card>
  )
}
