import * as React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Download, MoreVertical, Edit, Trash2, Search, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { DataTable } from "@/shared/components/DataTable";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/cn";
import type { Institution } from "../../model/institution.types";

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  institution: Institution;
  onEdit: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
}

const ActionsCell = ({ institution, onEdit, onDelete }: ActionsCellProps) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onEdit(institution);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onDelete(institution);
  };

  return (
    <div className="flex justify-center">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-color"
            onClick={(e) => e.stopPropagation()}
            aria-label={t("institution.actions")}
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

/**
 * Institution Management Page
 * Displays institution management interface
 */
export const InstitutionManagementPage = () => {
  const { t } = useTranslation();
  const [selectedRowId, setSelectedRowId] = React.useState<number | null>(null);

  // Column pinning state - pin select column to left and actions column to right
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["select"],
    right: ["actions"],
  });

  // TODO: Replace with actual API call to fetch institutions
  const institutions: Institution[] = [];
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  
  const handleFilterClick = () => {
    // TODO: Implement filter functionality
    console.log("Filter clicked");
  };

  const handleAddInstitution = () => {
    // TODO: Implement add institution functionality
    console.log("Add institution clicked");
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download clicked");
  };

  const handleEdit = (institution: Institution) => {
    // TODO: Implement edit institution functionality
    console.log("Edit institution:", institution);
  };

  const handleDelete = (institution: Institution) => {
    // TODO: Implement delete institution functionality
    console.log("Delete institution:", institution);
  };

  const columns = React.useMemo<ColumnDef<Institution>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div style={{ width: "50px", minWidth: "50px", maxWidth: "50px" }}>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label={t("institution.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div style={{ width: "50px", minWidth: "50px", maxWidth: "50px" }}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`${t("institution.selectRow")} ${
                row.original.institutionName
              }`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { width: 50 },
      },
      {
        accessorKey: "institutionId",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("institution.institutionId")}
          </div>
        ),
        cell: ({ row }) => {
          const institutionId = row.getValue("institutionId") as
            | string
            | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {institutionId || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "institutionName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("institution.institutionName")}
          </div>
        ),
        cell: ({ row }) => {
          const institutionName = row.getValue("institutionName") as
            | string
            | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {institutionName || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "address",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("institution.address")}
          </div>
        ),
        cell: ({ row }) => {
          const address = row.getValue("address") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {address || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "detailAddress",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("institution.detailAddress")}
          </div>
        ),
        cell: ({ row }) => {
          const detailAddress = row.getValue("detailAddress") as
            | string
            | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {detailAddress || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "phoneNumber",
        header: () => (
          <div style={{ width: "130px", minWidth: "130px", maxWidth: "130px" }}>
            {t("institution.phoneNumber")}
          </div>
        ),
        cell: ({ row }) => {
          const phoneNumber = row.getValue("phoneNumber") as string | undefined;
          return (
            <div
              style={{ width: "130px", minWidth: "130px", maxWidth: "130px" }}
            >
              {phoneNumber || "-"}
            </div>
          );
        },
        meta: { width: 130 },
      },
      {
        accessorKey: "manager",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("institution.manager")}
          </div>
        ),
        cell: ({ row }) => {
          const manager = row.getValue("manager") as string | undefined;
          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
              {manager || "-"}
            </div>
          );
        },
        meta: { width: 150 },
      },

      {
        id: "actions",
        header: () => (
          <div
            className="text-center"
            style={{ width: "80px", minWidth: "80px", maxWidth: "80px" }}
          >
            {t("institution.actions")}
          </div>
        ),
        cell: ({ row }) => {
          const institution = row.original;
          return (
            <div style={{ width: "80px", minWidth: "80px", maxWidth: "80px" }}>
              <ActionsCell
                institution={institution}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { width: 80 },
      },
    ],
    [t]
  );

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {/* Header with Title and Description */}
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between">
          {/* Left side: Title and Description */}
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {t("institution.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("institution.description")}
            </p>
          </div>
          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              {t("institution.download")}
            </Button>
            <Button onClick={handleAddInstitution}>
              <Plus className="h-4 w-4" />
              {t("institution.addInstitution")}
            </Button>
          </div>
        </div>
      </div>
      {/* Content Area with Card */}
      <div className="px-4 py-5">
        <div
          className={cn(
            "flex w-full flex-col rounded-2xl border border-border/20 bg-card shadow-sm px-4 py-6 space-y-4"
          )}
        >
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t("institution.searchPlaceholder") || "Search institutions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline" onClick={handleFilterClick}>
              <Filter className="h-4 w-4" />
              {t("institution.filter") || "Filter"}
            </Button>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <DataTable
              data={institutions}
              columns={columns}
              emptyMessage={t("institution.noData")}
              getHeaderClassName={(headerId) => {
                if (headerId === "actions") return "text-right";
                return "text-left";
              }}
              onRowClick={(row) => {
                setSelectedRowId(row.id);
              }}
              selectedRowId={selectedRowId}
              enableRowSelection={true}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
