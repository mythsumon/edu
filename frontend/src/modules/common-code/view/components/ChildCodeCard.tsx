import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { DataTable } from "@/shared/components/DataTable";
import { CustomConfirmDialog } from "@/shared/components/CustomConfirmDialog";
import { LoadingState } from "@/shared/components/LoadingState";
import { EmptyState } from "@/shared/components/EmptyState";
import { CreateCommonCodeDialog } from "./CreateCommonCodeDialog";
import { EditCommonCodeDialog } from "./EditCommonCodeDialog";
import {
  useCommonCodeChildrenQuery,
  useCommonCodeHasChildrenQuery,
} from "../../controller/queries";
import { useDeleteCommonCode } from "../../controller/mutations";
import { useToast } from "@/shared/ui/use-toast";
import type { CommonCodeResponseDto } from "../../model/common-code.types";
import { cn } from "@/shared/lib/cn";
import { debounce } from "@/shared/lib/debounce";

interface ActionsCellProps {
  code: CommonCodeResponseDto;
  onEdit: (code: CommonCodeResponseDto) => void;
  onDelete: (code: CommonCodeResponseDto) => void;
}

const ActionsCell = ({ code, onEdit, onDelete }: ActionsCellProps) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onEdit(code);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onDelete(code);
  };

  return (
    <div className="flex justify-end">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label={t("commonCode.actions")}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2 rounded-xl" align="end">
          <div className="flex flex-col">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Edit className="h-4 w-4" />
              {t("common.edit")}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface ChildCodeCardProps {
  parentId: number | null | undefined;
  parentCodeName?: string;
  parentCode?: string;
  onRowClick?: (code: CommonCodeResponseDto) => void;
}

export const ChildCodeCard = ({
  parentId,
  parentCodeName,
  parentCode,
  onRowClick,
}: ChildCodeCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = React.useState("");

  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  const { data: childrenData, isLoading } = useCommonCodeChildrenQuery(
    parentId,
    parentId !== null && parentId !== undefined,
    { q: debouncedSearchQuery || undefined, sort: "id,desc", page: 0, size: 0 }
  );
  console.log(childrenData);
  const deleteMutation = useDeleteCommonCode();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);

  const [selectedCode, setSelectedCode] =
    React.useState<CommonCodeResponseDto | null>(null);

  // Check if selected code has children - enable immediately when selectedCode is set
  const { data: hasChildren, isLoading: isCheckingChildren } =
    useCommonCodeHasChildrenQuery(selectedCode?.id, selectedCode !== null);

  // When children check completes, open appropriate dialog
  React.useEffect(() => {
    if (selectedCode && !isCheckingChildren && hasChildren !== undefined) {
      if (hasChildren) {
        // Code has children - show alert dialog
        setAlertDialogOpen(true);
      } else {
        // Code has no children - show confirm dialog
        setDeleteDialogOpen(true);
      }
    }
  }, [selectedCode, hasChildren, isCheckingChildren]);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [codeToEdit, setCodeToEdit] =
    React.useState<CommonCodeResponseDto | null>(null);
  const [selectedRowId, setSelectedRowId] = React.useState<number | null>(null);

  // Debounce search query
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setDebouncedSearchQuery(value);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  // Get data from API - sorting is handled by API

  // const tableData = React.useMemo(() => {
  //   if (
  //     !childrenData ||
  //     !childrenData.items ||
  //     !Array.isArray(childrenData.items)
  //   ) {
  //     return [];
  //   }
  //   return childrenData.items || [];
  // }, [childrenData]);

  const handleEdit = (code: CommonCodeResponseDto) => {
    setCodeToEdit(code);
    setEditDialogOpen(true);
  };

  const handleDelete = (code: CommonCodeResponseDto) => {
    setSelectedCode(code);
    // Children check will be triggered automatically via useEffect
  };

  // Handle delete confirmation - proceed with deletion
  const handleDeleteConfirm = React.useCallback(async () => {
    if (!selectedCode) return;

    // Proceed with deletion
    try {
      await deleteMutation.mutateAsync(selectedCode.id);
      toast({
        title: t("common.success"),
        description: t("commonCode.deleteSuccess"),
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setSelectedCode(null);
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          (error as { message?: string })?.message ??
          t("commonCode.deleteError"),
        variant: "error",
      });
    }
  }, [selectedCode, deleteMutation, toast, t]);

  const memoNextToCode = React.useMemo(() => {

    const data = childrenData?.items || [];

    if (data.length === 0) {
      return `${parentCode}-1`;
    }
    const lastCode = data[0].code;
    const lastCodeParts = lastCode.split("-");
    const lastCodeNumber = parseInt(
      lastCodeParts[lastCodeParts.length - 1],
      10
    );
    const next_code_number = isNaN(lastCodeNumber) ? 1 : lastCodeNumber + 1;
    const next_code = `${parentCode}-${next_code_number}`;
    return next_code;
  }, [parentCode, childrenData]);

  const columns = React.useMemo<ColumnDef<CommonCodeResponseDto>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("commonCode.code"),
        cell: ({ row }) => {
          const code = row.getValue("code") as string | undefined;
          return <div className="font-normal text-sm">{code ?? "-"}</div>;
        },
      },
      {
        accessorKey: "codeName",
        header: t("commonCode.titleName"),
        cell: ({ row }) => {
          const codeName = row.getValue("codeName") as string | undefined;
          return <div className="font-normal text-sm">{codeName || "-"}</div>;
        },
      },
      {
        id: "actions",
        header: t("commonCode.actions"),
        cell: ({ row }) => {
          const code = row.original;
          return (
            <ActionsCell
              code={code}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t]
  );

  // Show empty card when parentId is not provided
  if (parentId === null || parentId === undefined) {
    return (
      <div
        className={cn(
          "flex h-full w-[400px] flex-shrink-0 flex-col rounded-2xl border border-border/20 bg-card shadow-sm px-4 py-6 space-y-4",
          "overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-foreground">
            {t("commonCode.childCode")}
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            title={t("commonCode.noSelection")}
            description={t("commonCode.selectParentToViewChildren")}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-[400px] flex-shrink-0 flex-col rounded-2xl border border-border/20 bg-card shadow-sm px-4 py-6 space-y-4",
        "overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">
          {parentCodeName || t("commonCode.childCode")}
        </h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("commonCode.addition")}
        </Button>
      </div>
      {/* Search Bar */}
      <div>
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t("commonCode.searchPlaceholderWithCode")}
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      {/* Table */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <LoadingState />
        ) : childrenData?.items?.length === 0 ? (
          <EmptyState
            title={t("commonCode.noChildrenFound")}
            description={t("commonCode.noChildrenDescription")}
          />
        ) : (
          <DataTable
            data={childrenData?.items || []}
            columns={columns}
            getHeaderClassName={(headerId) => {
              if (headerId === "actions") return "text-right";
              return "text-left";
            }}
            onRowClick={(row) => {
              setSelectedRowId(row.id);
              onRowClick?.(row);
            }}
            selectedRowId={selectedRowId}
          />
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <CustomConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setSelectedCode(null);
          }
        }}
        title={t("commonCode.deleteTitle")}
        description={
          selectedCode
            ? t("commonCode.deleteDescription", { name: selectedCode.codeName })
            : ""
        }
        variant="destructive"
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending || isCheckingChildren}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedCode(null);
        }}
      />
      {/* Alert Dialog - Code has children */}
      <CustomConfirmDialog
        open={alertDialogOpen}
        onOpenChange={(open) => {
          setAlertDialogOpen(open);
          if (!open) {
            setSelectedCode(null);
          }
        }}
        title={t("commonCode.hasChildrenDeleteError")}
        description={t("commonCode.hasChildrenDeleteErrorDescription")}
        variant="warning"
        confirmText={t("common.close")}
        showCancel={false}
        onConfirm={() => {
          setAlertDialogOpen(false);
          setSelectedCode(null);
        }}
      />
      <CreateCommonCodeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentId={parentId ?? null}
        parentCodeName={parentCodeName}
        nextToCode={memoNextToCode}
      />
      <EditCommonCodeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        code={codeToEdit}
        parentCodeName={parentCodeName}
      />
    </div>
  );
};
