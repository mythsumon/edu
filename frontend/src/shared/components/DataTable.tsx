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
  type ColumnPinningState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
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
  enableColumnPinning?: boolean;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (pinning: ColumnPinningState) => void;
  isLoading?: boolean;
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
  enableColumnPinning = false,
  columnPinning: controlledColumnPinning,
  onColumnPinningChange,
  isLoading = false,
}: // enablePagination = false,
DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: [],
    right: [],
  });

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

  const handleColumnPinningChange = React.useCallback(
    (updater: ColumnPinningState | ((old: ColumnPinningState) => ColumnPinningState)) => {
      const newPinning =
        typeof updater === "function" ? updater(columnPinning) : updater;
      setColumnPinning(newPinning);
      onColumnPinningChange?.(newPinning);
    },
    [columnPinning, onColumnPinningChange]
  );

  const effectiveColumnPinning = controlledColumnPinning ?? columnPinning;

  // Filter out columnPinning from initialState if column pinning is disabled
  const filteredInitialState = React.useMemo(() => {
    if (!initialState) return undefined;
    if (enableColumnPinning) return initialState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { columnPinning, ...rest } = initialState;
    return rest;
  }, [initialState, enableColumnPinning]);

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
    onColumnPinningChange: enableColumnPinning
      ? handleColumnPinningChange
      : undefined,
    state: {
      rowSelection: enableRowSelection ? rowSelection : undefined,
      ...(enableColumnPinning && {
        columnPinning: effectiveColumnPinning,
      }),
    },
    enableRowSelection,
    enableColumnPinning,
    initialState: filteredInitialState,
  });

  const columnCount = table.getAllColumns().length;

  return (
    <div className={cn("rounded-xl overflow-hidden", className)}>
      <Table className="">
        <TableHeader className="bg-muted rounded-t-2xl text-xs">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-muted hover:bg-muted/50"
            >
              {headerGroup.headers.map((header, index, headers) => {
                // Default className for select and actions columns
                const defaultClassName =
                  header.id === "select" || header.id === "actions"
                    ? "w-12"
                    : "";
                const customClassName = getHeaderClassName?.(header.id);
                const className = customClassName ?? defaultClassName;
                const isLastColumn = index === headers.length - 1;
                
                // Column pinning styles
                const pinnedPosition = enableColumnPinning
                  ? header.column.getIsPinned()
                  : false;
                const isPinned = !!pinnedPosition;
                const pinnedStyle = isPinned && pinnedPosition
                  ? {
                      position: "sticky" as const,
                      ...(pinnedPosition === "left"
                        ? {
                            left: header.column.getStart(pinnedPosition),
                            zIndex: 10,
                          }
                        : pinnedPosition === "right"
                        ? {
                            right: header.column.getAfter(pinnedPosition),
                            zIndex: 10,
                          }
                        : {}),
                    }
                  : {};

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-12 relative",
                      className,
                      isPinned && "bg-muted",
                      pinnedPosition &&
                        header.column.getIsLastColumn(pinnedPosition) &&
                        pinnedPosition === "left" &&
                        "shadow-[1px_0_2px_rgba(0,0,0,0.05)]",
                      pinnedPosition &&
                        header.column.getIsFirstColumn(pinnedPosition) &&
                        pinnedPosition === "right" &&
                        "shadow-[-1px_0_2px_rgba(0,0,0,0.05)]"
                    )}
                    style={pinnedStyle}
                  >
                    {!isLastColumn && (
                      <div className="absolute w-px h-6 bg-secondary-foreground/10 top-3 right-0" />
                    )}
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
        <TableBody className="text-sm">
          {isLoading ? (
            // Skeleton loading rows
            [...Array(10)].map((_, index) => (
              <TableRow key={`skeleton-${index}`} className="bg-muted/10">
                {table.getAllColumns().map((column) => (
                  <TableCell key={column.id} className="h-12">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
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
                  {row.getVisibleCells().map((cell) => {
                    // Column pinning styles
                    const pinnedPosition = enableColumnPinning
                      ? cell.column.getIsPinned()
                      : false;
                    const isPinned = !!pinnedPosition;
                    const pinnedStyle = isPinned && pinnedPosition
                      ? {
                          position: "sticky" as const,
                          ...(pinnedPosition === "left"
                            ? {
                                left: cell.column.getStart(pinnedPosition),
                                zIndex: 5,
                              }
                            : pinnedPosition === "right"
                            ? {
                                right: cell.column.getAfter(pinnedPosition),
                                zIndex: 5,
                              }
                            : {}),
                        }
                      : {};

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          isPinned && "bg-background",
                          pinnedPosition &&
                            cell.column.getIsLastColumn(pinnedPosition) &&
                            pinnedPosition === "left" &&
                            "shadow-[1px_0_2px_rgba(0,0,0,0.05)]",
                          pinnedPosition &&
                            cell.column.getIsFirstColumn(pinnedPosition) &&
                            pinnedPosition === "right" &&
                            "shadow-[-1px_0_2px_rgba(0,0,0,0.05)]"
                        )}
                        style={pinnedStyle}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
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
