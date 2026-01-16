import * as React from "react";
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
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/cn";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyMessage?: string;
  className?: string;
  getHeaderClassName?: (headerId: string) => string;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onRowClick?: (row: TData) => void;
  selectedRowId?: string | number | null | ((row: TData) => boolean);
  initialState?: TableOptions<TData>["initialState"];
  enablePagination?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = "No data found.",
  className,
  getHeaderClassName,
  enableRowSelection = false,
  onRowSelectionChange,
  onRowClick,
  selectedRowId,
  initialState,
  // enablePagination = false,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const handleRowSelectionChange = React.useCallback(
    (
      updater:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      setRowSelection((prev) => {
        const newSelection =
          typeof updater === "function" ? updater(prev) : updater;
        onRowSelectionChange?.(newSelection);
        return newSelection;
      });
    },
    [onRowSelectionChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: enableRowSelection
      ? handleRowSelectionChange
      : undefined,
    state: {
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    enableRowSelection,
    initialState: {
      ...initialState,
      // pagination: enablePagination ? initialState?.pagination : { pageIndex: 0, pageSize: data.length },
    },
  });

  const columnCount = table.getAllColumns().length;

  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-muted rounded-t-2xl text-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted/50">
              {headerGroup.headers.map((header) => {
                // Default className for select and actions columns
                const defaultClassName =
                  header.id === "select" || header.id === "actions"
                    ? "w-12"
                    : "";
                const customClassName = getHeaderClassName?.(header.id);
                const className = customClassName ?? defaultClassName;

                return (
                  <TableHead key={header.id} className={cn("h-12", className)}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isSelected =
                selectedRowId !== undefined
                  ? typeof selectedRowId === "function"
                    ? selectedRowId(row.original)
                    : (row.original as { id?: string | number }).id ===
                      selectedRowId
                  : enableRowSelection && row.getIsSelected();

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    isSelected ? "bg-primary text-primary" : "bg-muted/10"
                  )}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-20 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
