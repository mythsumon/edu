import * as React from "react";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Clock, X, Eye } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { ScheduleItem } from "../../model/training.types";
import { formatDateTime } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";

interface ScheduleTableProps {
  data: ScheduleItem[];
  paginationData: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  columnPinning: ColumnPinningState;
  onColumnPinningChange: (pinning: ColumnPinningState) => void;
}

/**
 * Schedule Table Component
 * Displays the schedule data table with search and pagination
 */
export const ScheduleTable = ({
  data,
  paginationData,
  onPageChange,
  onSizeChange,
  columnPinning,
  onColumnPinningChange,
}: ScheduleTableProps) => {
  const { t } = useTranslation();

  // Define columns
  const columns: ColumnDef<ScheduleItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "educationId",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.schedule.educationId")}
          </div>
        ),
        cell: ({ row }) => {
          const educationId = row.getValue("educationId") as number | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {educationId ?? "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "trainingName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.schedule.trainingName")}
          </div>
        ),
        cell: ({ row }) => {
          const trainingName = row.getValue("trainingName") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {trainingName || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "institutionName",
        header: () => (
          <div style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}>
            {t("lecture.schedule.institutionName")}
          </div>
        ),
        cell: ({ row }) => {
          const institutionName = row.getValue("institutionName") as string | undefined;
          return (
            <div
              style={{ width: "180px", minWidth: "180px", maxWidth: "180px" }}
            >
              {institutionName || "-"}
            </div>
          );
        },
        meta: { width: 180 },
      },
      {
        accessorKey: "documentStatus",
        header: () => (
          <div style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}>
            {t("lecture.schedule.documentStatus")}
          </div>
        ),
        cell: ({ row }) => {
          const documentStatus = row.getValue("documentStatus") as ScheduleItem["documentStatus"];
          return (
            <div
              className="flex flex-col gap-1"
              style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}
            >
              {documentStatus?.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {doc.type === "pending" && (
                    <Clock className="h-4 w-4 text-primary" />
                  )}
                  {doc.type === "missing" && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  {doc.type === "completed" && (
                    <div className="h-4 w-4 rounded-full bg-primary" />
                  )}
                  <span className="text-foreground">{doc.name}</span>
                  {doc.count !== undefined && (
                    <span className="text-primary font-medium">{doc.count}</span>
                  )}
                </div>
              ))}
            </div>
          );
        },
        meta: { width: 250 },
      },
      {
        accessorKey: "overallStatus",
        header: () => (
          <div style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}>
            {t("lecture.schedule.overallStatus")}
          </div>
        ),
        cell: ({ row }) => {
          const overallStatus = row.getValue("overallStatus") as string | undefined;
          return (
            <div
              style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}
            >
              <span
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground"
                )}
              >
                {overallStatus || "-"}
              </span>
            </div>
          );
        },
        meta: { width: 140 },
      },
      {
        accessorKey: "lastModifiedDate",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.schedule.lastModifiedDate")}
          </div>
        ),
        cell: ({ row }) => {
          const lastModifiedDate = row.getValue("lastModifiedDate") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {lastModifiedDate ? formatDateTime(lastModifiedDate) : "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "management",
        header: () => (
          <div style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}>
            {t("lecture.schedule.management")}
          </div>
        ),
        cell: ({ row }) => {
          const management = row.getValue("management") as string | undefined;
          return (
            <div
              style={{ width: "140px", minWidth: "140px", maxWidth: "140px" }}
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                {management || "-"}
              </span>
            </div>
          );
        },
        meta: { width: 140 },
      },
    ],
    [t]
  );

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <DataTable
          data={data}
          columns={columns}
          emptyMessage={t("lecture.schedule.noData")}
          getHeaderClassName={(headerId) => {
            if (headerId === "actions") return "text-right";
            return "text-left";
          }}
          enableRowSelection={false}
          enableColumnPinning={true}
          columnPinning={columnPinning}
          onColumnPinningChange={onColumnPinningChange}
          isLoading={false}
        />
      </div>

      {/* Pagination */}
      <CustomPagination
        total={paginationData.total}
        page={paginationData.page}
        size={paginationData.size}
        totalPages={paginationData.totalPages}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
    </>
  );
};
