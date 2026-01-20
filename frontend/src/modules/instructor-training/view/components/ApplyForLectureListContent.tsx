import * as React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, X, Check } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/components/DataTable";
import { TabContainer, type TabConfig } from "./TabsContainer";
import type { TrainingSessionForApplication } from "../../model/training.types";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";
import { MOCK_TRAINING_SESSIONS } from "./trainingSessionForApplication.mock";

/**
 * Apply For Lecture List Content Component
 * Displays training sessions available for application with tabs and table
 */
export const ApplyForLectureListContent = () => {
  const { t } = useTranslation();

  // State
  const [activeTab, setActiveTab] = React.useState<string>("open");
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: [],
  });

  // Filter data based on tab
  const getFilteredDataForTab = React.useCallback(
    (tabValue: string) => {
      if (tabValue === "open") {
        // Available for application - sessions that are not past deadline
        const today = new Date();
        return MOCK_TRAINING_SESSIONS.filter((session) => {
          const endDate = new Date(session.period.endDate);
          return endDate >= today;
        });
      } else if (tabValue === "closed") {
        // Deadline - sessions that are past deadline
        const today = new Date();
        return MOCK_TRAINING_SESSIONS.filter((session) => {
          const endDate = new Date(session.period.endDate);
          return endDate < today;
        });
      }
      return MOCK_TRAINING_SESSIONS;
    },
    []
  );

  // Handle role selection
  const handleRoleSelect = React.useCallback(
    (sessionId: number, role: "mainLecturer" | "assistantTeacher") => {
      // TODO: Handle role selection/application
      console.log("Select role for session:", sessionId, role);
    },
    []
  );

  // Handle role removal
  const handleRoleRemove = React.useCallback((sessionId: number, role: "mainLecturer" | "assistantTeacher") => {
    // TODO: Handle role removal
    console.log("Remove role for session:", sessionId, role);
  }, []);

  // Table columns factory
  const createColumns = (
    onRoleSelect: (sessionId: number, role: "mainLecturer" | "assistantTeacher") => void,
    onRoleRemove: (sessionId: number, role: "mainLecturer" | "assistantTeacher") => void
  ): ColumnDef<TrainingSessionForApplication>[] => {
    return [
      {
        accessorKey: "institutionName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.apply.institutionName")}
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
        accessorKey: "gradeAndClass",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.apply.gradeAndClass")}
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
        accessorKey: "trainingName",
        header: () => (
          <div style={{ width: "300px", minWidth: "300px", maxWidth: "300px" }}>
            {t("lecture.apply.trainingName")}
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
        accessorKey: "region",
        header: () => (
          <div style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
            {t("lecture.apply.region")}
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
            {t("lecture.apply.period")}
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
      {
        id: "select",
        header: () => (
          <div style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}>
            {t("lecture.apply.select")}
          </div>
        ),
        cell: ({ row }) => {
          const session = row.original;
          return (
            <div
              className="flex flex-col gap-2"
              style={{ width: "250px", minWidth: "250px", maxWidth: "250px" }}
            >
              {session.roles.map((roleOption, index) => {
                const roleLabel =
                  roleOption.role === "mainLecturer"
                    ? t("lecture.apply.mainLecturer")
                    : t("lecture.apply.assistantTeacher");
                const statusLabel = roleOption.status
                  ? roleOption.status === "confirmed"
                    ? t("lecture.apply.confirmed")
                    : t("lecture.apply.unconfirmed")
                  : "";

                if (roleOption.isSelected) {
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRoleRemove(session.id, roleOption.role)}
                        className="flex items-center gap-1"
                      >
                        {roleOption.status === "confirmed" ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        {roleLabel}
                      </Button>
                      {statusLabel && (
                        <span className="text-xs text-muted-foreground">
                          ({statusLabel})
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={index} className="flex items-center gap-2">
                    <Button
                      variant={roleOption.role === "mainLecturer" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onRoleSelect(session.id, roleOption.role)}
                      disabled={roleOption.isDisabled}
                      className="flex items-center gap-1"
                    >
                      {roleOption.role === "mainLecturer"
                        ? t("lecture.apply.applyForMainLecturer")
                        : roleLabel}
                    </Button>
                    {statusLabel && (
                      <span className="text-xs text-muted-foreground">
                        ({statusLabel})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        },
        meta: { width: 250 },
      },
      {
        accessorKey: "educationId",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.apply.educationId")}
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
    ];
  };

  // Tab configurations
  const tabConfigs: TabConfig[] = React.useMemo(() => {
    const openData = getFilteredDataForTab("open");
    const closedData = getFilteredDataForTab("closed");

    const openColumns = createColumns(handleRoleSelect, handleRoleRemove);
    const closedColumns = createColumns(handleRoleSelect, handleRoleRemove);

    return [
      {
        value: "open",
        label: (
          <>
            {t("lecture.apply.tabs.availableForApplication")} ({openData.length})
          </>
        ),
        content:
          openData.length > 0 ? (
            <DataTable
              data={openData}
              columns={openColumns}
              emptyMessage={t("lecture.apply.noData")}
              enableRowSelection={false}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
              isLoading={false}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("lecture.apply.noTrainingAvailable")}
              </p>
            </div>
          ),
      },
      {
        value: "closed",
        label: (
          <>
            {t("lecture.apply.tabs.deadline")} ({closedData.length})
          </>
        ),
        content:
          closedData.length > 0 ? (
            <DataTable
              data={closedData}
              columns={closedColumns}
              emptyMessage={t("lecture.apply.noData")}
              enableRowSelection={false}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
              isLoading={false}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("lecture.apply.noTrainingAvailable")}
              </p>
            </div>
          ),
      },
    ];
  }, [t, getFilteredDataForTab, handleRoleSelect, handleRoleRemove, columnPinning, setColumnPinning]);

  return (
    <div className="px-4 py-5">
      {/* Tabs Container */}
      <Card className="rounded-xl mb-6">
        <div className="p-4">
          <TabContainer
            tabs={tabConfigs}
            currentValue={activeTab}
            defaultValue="open"
            onValueChange={setActiveTab}
            className="w-full"
          />
        </div>
      </Card>
    </div>
  );
};
