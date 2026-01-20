import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Eye, Search, Filter } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { DataTable } from "@/shared/components/DataTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { AdminTraining } from "../../model/admin-training.types";

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  training: AdminTraining;
  onDetail: (training: AdminTraining) => void;
}

const ActionsCell = ({ training, onDetail }: ActionsCellProps) => {
  const { t } = useTranslation();

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDetail(training);
  };

  return (
    <div className="flex justify-center">
      <button
        className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1 rounded-lg hover:bg-muted transition-colors border border-secondary-foreground/30"
        onClick={handleDetail}
        aria-label={t("common.detail")}
      >
        <Eye className="h-4 w-4" />
        <span className="text-xs">{t("common.detail")}</span>
      </button>
    </div>
  );
};

/**
 * Admin Training Page
 * Displays admin training management interface
 */
export const AdminTrainingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Column pinning state - pin select column to left and actions column to right
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: ["actions"],
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(20);

  // Filter state (will be used when filter dialog is implemented)
  const [filterCount] = React.useState<number>(0);

  // Mock empty data - will be replaced with actual API calls later
  const trainings: AdminTraining[] = [];

  // Mock pagination data
  const paginationData = React.useMemo(() => {
    return {
      total: 0,
      page: page,
      size: size,
      totalPages: 0,
    };
  }, [page, size]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle size change
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const handleAddTraining = () => {
    navigate(ROUTES.ADMIN_TRAINING_CREATE_FULL);
  };

  const handleDownload = () => {
    // TODO: Implement export functionality
    console.log("Download clicked");
  };

  const handleFilter = () => {
    // TODO: Open filter dialog
    console.log("Filter clicked");
  };

  const handleDetail = React.useCallback((training: AdminTraining) => {
    // TODO: Navigate to admin training detail page
    console.log("View detail:", training);
  }, []);

  const columns = React.useMemo<ColumnDef<AdminTraining>[]>(
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
              aria-label={t("training.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div style={{ width: "50px", minWidth: "50px", maxWidth: "50px" }}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`${t("training.selectRow")} ${row.original.name}`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { width: 50 },
      },
      {
        accessorKey: "trainingId",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("training.trainingId")}
          </div>
        ),
        cell: ({ row }) => {
          const trainingId = row.getValue("trainingId") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {trainingId || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "name",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("training.trainingName")}
          </div>
        ),
        cell: ({ row }) => {
          const name = row.getValue("name") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {name || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "status",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("training.status")}
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string | undefined;
          const statusLower = status?.toLowerCase() || "";

          // Determine badge color based on status
          let badgeClass = "bg-muted text-muted-foreground"; // default/inactive
          if (statusLower === "active") {
            badgeClass = "bg-green-100 text-green-700";
          } else if (statusLower === "pending") {
            badgeClass = "bg-orange-100 text-yellow-700";
          } else if (statusLower === "inactive") {
            badgeClass = "bg-gray-100 text-gray-600";
          }

          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
              {status ? (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}
                >
                  {status}
                </span>
              ) : (
                "-"
              )}
            </div>
          );
        },
        meta: { width: 150 },
      },
      {
        accessorKey: "description",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("training.notes")}
          </div>
        ),
        cell: ({ row }) => {
          const description = row.getValue("description") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {description || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("training.registrationDate")}
          </div>
        ),
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string | undefined;
          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
              {createdAt || "-"}
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
            {t("training.actions")}
          </div>
        ),
        cell: ({ row }) => {
          const training = row.original;
          return (
            <div style={{ width: "80px", minWidth: "80px", maxWidth: "80px" }}>
              <ActionsCell training={training} onDetail={handleDetail} />
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: { width: 80 },
      },
    ],
    [t, handleDetail]
  );

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {/* Header with Title and Description */}
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between">
          {/* Left side: Title and Description */}
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {t("training.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("training.description")}
            </p>
          </div>
          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              {t("training.download")}
            </Button>
            <Button onClick={handleAddTraining}>
              <Plus className="h-4 w-4" />
              {t("training.addTraining")}
            </Button>
          </div>
        </div>
      </div>
      {/* Content Area with Card */}
      <div className="px-4 py-5">
        <Card>
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t("training.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearchChange}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleFilter}
              className={filterCount > 0 ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4" />
              {t("training.filter")}
              {filterCount > 0 && (
                <span className="ml-1 w-5 h-5 justify-center items-center flex text-xs bg-badge text-primary rounded-full">
                  {filterCount}
                </span>
              )}
            </Button>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <DataTable
              data={trainings}
              columns={columns}
              emptyMessage={t("training.noData")}
              getHeaderClassName={(headerId) => {
                if (headerId === "actions") return "text-right";
                return "text-left";
              }}
              enableRowSelection={true}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
            />
          </div>
        </Card>
        {/* Pagination */}
        <CustomPagination
          total={paginationData.total}
          page={paginationData.page}
          size={paginationData.size}
          totalPages={paginationData.totalPages}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
        />
      </div>
    </div>
  );
};
