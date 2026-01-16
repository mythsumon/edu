import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type TableOptions,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  emptyMessage?: string
  className?: string
  getHeaderClassName?: (headerId: string) => string
  enableRowSelection?: boolean
  onRowSelectionChange?: (selection: RowSelectionState) => void
  initialState?: TableOptions<TData>['initialState']
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = 'No data found.',
  className,
  getHeaderClassName,
  enableRowSelection = false,
  onRowSelectionChange,
  initialState,
  searchPlaceholder,
  onSearchChange,
  searchValue,
}: DataTableProps<TData>) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState(searchValue || '')

  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      setRowSelection((prev) => {
        const newSelection = typeof updater === 'function' ? updater(prev) : updater
        onRowSelectionChange?.(newSelection)
        return newSelection
      })
    },
    [onRowSelectionChange]
  )

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value)
      onSearchChange?.(value)
    },
    [onSearchChange]
  )

  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue)
    }
  }, [searchValue])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: enableRowSelection ? handleRowSelectionChange : undefined,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      rowSelection: enableRowSelection ? rowSelection : undefined,
      globalFilter,
    },
    enableRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
      ...initialState,
    },
  })

  const columnCount = table.getAllColumns().length
  const pageSizeOptions = [10, 20, 30, 50, 100]

  return (
    <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 p-4 border-b">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder || t('common.search')}
            value={globalFilter}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="max-w-md"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Filter button - no action for now
          }}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('common.filter')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // Default className for select and actions columns
                const defaultClassName =
                  header.id === 'select' || header.id === 'actions' ? 'w-12' : ''
                const customClassName = getHeaderClassName?.(header.id)
                const className = customClassName ?? defaultClassName

                return (
                  <TableHead key={header.id} className={className}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {t('dataTable.totalCases', {
            count: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              disabled
            >
              {table.getState().pagination.pageIndex + 1}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / {t('dataTable.page')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
