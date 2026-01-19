import * as React from "react";
import { useTranslation } from "react-i18next";
import { Search, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { DataTable } from "@/shared/components/DataTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { TrainingApplicationItem } from "../../model/training.types";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import { MOCK_TRAINING_APPLICATIONS } from "../model/trainingApplication.mock";

/**
 * Training Application List Content Component
 * Displays the list of training applications with search and pagination
 */
export const TrainingApplicationListContent = () => {
  const { t } = useTranslation();

  // State
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(20);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: [],
  });

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return MOCK_TRAINING_APPLICATIONS;
    }
    const query = searchQuery.toLowerCase();
    return MOCK_TRAINING_APPLICATIONS.filter(
      (item) =>
        item.educationId.toLowerCase().includes(query) ||
        item.trainingName.toLowerCase().includes(query) ||
        item.educationalInstitutions.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    return filteredData.slice(page * size, (page + 1) * size);
  }, [filteredData, page, size]);

  const total = filteredData.length;
  const totalPages = Math.ceil(total / size);

  // Handle search change
  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setPage(0); // Reset to first page on search
    },
    []
  );

  // Handle page change
  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handle size change
  const handleSizeChange = React.useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  // Handle view details click
  const handleViewDetails = React.useCallback((item: TrainingApplicationItem) => {
    // TODO: Navigate to details page
    console.log("View details for application:", item.id);
  }, []);

  // Table columns
  const columns: ColumnDef<TrainingApplicationItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "educationId",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.application.educationId")}
          </div>
        ),
        cell: ({ row }) => {
          const educationId = row.getValue("educationId") as string | undefined;
          return (
            <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
              {educationId || "-"}
            </div>
          );
        },
        meta: { width: 150 },
      },
      {
        accessorKey: "trainingName",
        header: () => (
          <div style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}>
            {t("lecture.application.trainingName")}
          </div>
        ),
        cell: ({ row }) => {
          const trainingName = row.getValue("trainingName") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}
            >
              {trainingName || "-"}
            </div>
          );
        },
        meta: { width: 250 },
      },
      {
        accessorKey: "educationalInstitutions",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.application.educationalInstitutions")}
          </div>
        ),
        cell: ({ row }) => {
          const institutions = row.getValue(
            "educationalInstitutions"
          ) as string | undefined;
          return (
            <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
              {institutions || "-"}
            </div>
          );
        },
        meta: { width: 150 },
      },
      {
        accessorKey: "applicationRole",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.application.applicationRole")}
          </div>
        ),
        cell: ({ row }) => {
          const role = row.getValue("applicationRole") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {role || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "applicationDate",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.application.applicationDate")}
          </div>
        ),
        cell: ({ row }) => {
          const date = row.getValue("applicationDate") as string | undefined;
          return (
            <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
              {date ? formatDate(date) : "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "situation",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.application.situation")}
          </div>
        ),
        cell: ({ row }) => {
          const situation = row.getValue("situation") as
            | "confirmed"
            | "atmosphere"
            | "rejected"
            | "deleted"
            | undefined;
          const getStatusConfig = () => {
            switch (situation) {
              case "confirmed":
                return {
                  label: t("lecture.application.confirmed"),
                  dotColor: "bg-primary", // Green for confirmed
                };
              case "atmosphere":
                return {
                  label: t("lecture.application.atmosphere"),
                  dotColor: "bg-primary", // Blue for atmosphere (using primary as blue)
                };
              case "rejected":
              case "deleted":
                return {
                  label: t("lecture.application.rejected"),
                  dotColor: "bg-destructive", // Red for rejected/deleted
                };
              default:
                return {
                  label: "-",
                  dotColor: "bg-muted",
                };
            }
          };
          const config = getStatusConfig();
          return (
            <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
              <span className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
                <span className="text-sm">{config.label}</span>
              </span>
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        id: "work",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.application.work")}
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
              <span
                className="text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1"
                onClick={() => handleViewDetails(item)}
              >
                <Eye className="h-4 w-4" />
                {t("lecture.application.viewDetails")}
              </span>
            </div>
          );
        },
        meta: { width: 120 },
      },
    ],
    [t, handleViewDetails]
  );

  return (
    <div className="px-4 py-5">
      <Card className="rounded-xl">
        {/* Search Bar */}
        <div className="p-4 pb-0">
          <Input
            type="text"
            placeholder={t("lecture.application.searchPlaceholder")}
            value={searchQuery}
            onChange={handleSearchChange}
            icon={<Search className="h-4 w-4" />}
            className="max-w-md"
          />
        </div>

        {/* Table */}
        <div className="px-4 pt-0">
          <div className="overflow-x-auto">
            <DataTable
              data={paginatedData}
              columns={columns}
              emptyMessage={t("lecture.application.noData")}
              getHeaderClassName={(headerId) => {
                if (headerId === "work") return "text-right";
                return "text-left";
              }}
              enableRowSelection={false}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
              isLoading={false}
            />
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-4">
              <CustomPagination
                total={total}
                page={page}
                size={size}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
                showResultsCount={true}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
