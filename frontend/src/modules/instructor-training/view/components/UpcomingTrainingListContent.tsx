import * as React from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Card } from "@/shared/ui/card";
import { DataTable } from "@/shared/components/DataTable";
import type { TrainingSessionForApplication } from "../../model/training.types";
import { formatDate } from "@/shared/lib/date";
import { MOCK_UPCOMING_TRAININGS } from "./upcomingTraining.mock";

/**
 * Upcoming Training List Content Component
 * Displays upcoming training sessions scheduled to open
 */
export const UpcomingTrainingListContent = () => {
  const { t } = useTranslation();

  // State
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: [],
  });

  // Table columns
  const columns: ColumnDef<TrainingSessionForApplication>[] = React.useMemo(
    () => [
      {
        accessorKey: "educationId",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.upcoming.educationId")}
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
          <div style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}>
            {t("lecture.upcoming.trainingName")}
          </div>
        ),
        cell: ({ row }) => {
          const name = row.getValue("trainingName") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}
            >
              {name || "-"}
            </div>
          );
        },
        meta: { width: 300 },
      },
      {
        accessorKey: "gradeAndClass",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.upcoming.gradeAndClass")}
          </div>
        ),
        cell: ({ row }) => {
          const gradeClass = row.getValue("gradeAndClass") as string | undefined;
          return (
            <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
              {gradeClass || "-"}
            </div>
          );
        },
        meta: { width: 150 },
      },
      {
        accessorKey: "institutionName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.upcoming.institutionName")}
          </div>
        ),
        cell: ({ row }) => {
          const name = row.getValue("institutionName") as string | undefined;
          return (
            <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
              {name || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "region",
        header: () => (
          <div style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
            {t("lecture.upcoming.region")}
          </div>
        ),
        cell: ({ row }) => {
          const region = row.getValue("region") as string | undefined;
          return (
            <div style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
              {region || "-"}
            </div>
          );
        },
        meta: { width: 100 },
      },
      {
        accessorKey: "period",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.upcoming.period")}
          </div>
        ),
        cell: ({ row }) => {
          const period = row.getValue("period") as
            | { startDate: string; endDate: string }
            | undefined;
          return (
            <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
              {period
                ? `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`
                : "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
    ],
    [t]
  );

  // Show empty state if no data
  if (MOCK_UPCOMING_TRAININGS.length === 0) {
    return (
      <div className="px-4 py-5">
        <Card className="rounded-xl">
          <div className="p-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("lecture.upcoming.noUpcomingSessions")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <Card className="rounded-xl">
        <div className="p-4">
          <DataTable
            data={MOCK_UPCOMING_TRAININGS}
            columns={columns}
            emptyMessage={t("lecture.upcoming.noData")}
            enableRowSelection={false}
            enableColumnPinning={true}
            columnPinning={columnPinning}
            onColumnPinningChange={setColumnPinning}
            isLoading={false}
          />
        </div>
      </Card>
    </div>
  );
};
