import * as React from "react";
import { useTranslation } from "react-i18next";
import { Search, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { DataTable } from "@/shared/components/DataTable";
import { CustomPagination } from "@/shared/components/CustomPagination";
import type { ConfirmedScheduleItem } from "../../model/lecture.types";
import { formatDate } from "@/shared/lib/date";
import { cn } from "@/shared/lib/cn";

// Mock data
const MOCK_CONFIRMED_SCHEDULES: ConfirmedScheduleItem[] = [
  {
    id: 1,
    educationId: "EDU-2025-001",
    trainingName: "Lesson 12: Block Coding and Metaverse Basics and Artificial Intelligence (AI)",
    educationalInstitutions: "Gyeonggi Future Filling",
    region: "Zone 1",
    gradeAndClass: "Class 3, Grade 1",
    schedule: {
      startDate: "2025-01-15",
      endDate: "2025-02-28",
    },
  },
  {
    id: 2,
    educationId: "EDU-2025-003",
    trainingName: "50th In-Depth Programming Course",
    educationalInstitutions: "Seongnam Office of Education",
    region: "Zone 3",
    gradeAndClass: "4th grade class 2",
    schedule: {
      startDate: "2025-03-01",
      endDate: "2025-05-30",
    },
  },
  {
    id: 3,
    educationId: "EDU-2025-006",
    trainingName: "New Instructor Training Program",
    educationalInstitutions: "Bucheon Office of Education",
    region: "Zone 6",
    gradeAndClass: "Class 1, Grade 2",
    schedule: {
      startDate: "2025-04-15",
      endDate: "2025-06-30",
    },
  },
  {
    id: 4,
    educationId: "EDU-2024-100",
    trainingName: "Block Coding Education in the Second Half of 2024",
    educationalInstitutions: "Suwon Office of Education",
    region: "Suwon City",
    gradeAndClass: "Class 2, Grade 3",
    schedule: {
      startDate: "2024-09-01",
      endDate: "2024-11-30",
    },
  },
  {
    id: 5,
    educationId: "EDU-2024-101",
    trainingName: "AI Basics Training in the First Half of 2024",
    educationalInstitutions: "Seongnam Office of Education",
    region: "Seongnam City",
    gradeAndClass: "5th grade class 1",
    schedule: {
      startDate: "2024-03-01",
      endDate: "2024-05-31",
    },
  },
];

/**
 * Confirmed Schedule List Content Component
 * Contains the main content logic for the confirmed schedule list
 */
export const ConfirmedScheduleListContent = () => {
  const { t } = useTranslation();

  // Column pinning state
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: [],
  });

  // Search and pagination state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(20);

  // Filter by search query
  const filteredSchedules = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return MOCK_CONFIRMED_SCHEDULES;
    }
    const query = searchQuery.toLowerCase();
    return MOCK_CONFIRMED_SCHEDULES.filter(
      (schedule) =>
        schedule.educationId.toLowerCase().includes(query) ||
        schedule.trainingName.toLowerCase().includes(query) ||
        schedule.educationalInstitutions.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Paginate filtered schedules
  const schedules = React.useMemo(() => {
    const start = page * size;
    const end = start + size;
    return filteredSchedules.slice(start, end);
  }, [filteredSchedules, page, size]);

  const paginationData = React.useMemo(() => {
    const total = filteredSchedules.length;
    const totalPages = Math.ceil(total / size);
    return {
      total,
      page,
      size,
      totalPages,
    };
  }, [filteredSchedules.length, page, size]);

  // Handle search change
  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setPage(0);
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

  // Define columns
  const columns: ColumnDef<ConfirmedScheduleItem>[] = React.useMemo(
    () => [
      {
        accessorKey: "educationId",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("lecture.confirmed.educationId")}
          </div>
        ),
        cell: ({ row }) => {
          const educationId = row.getValue("educationId") as string | undefined;
          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
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
            {t("lecture.confirmed.trainingName")}
          </div>
        ),
        cell: ({ row }) => {
          const trainingName = row.getValue("trainingName") as string | undefined;
          return (
            <div
              className="font-medium text-foreground"
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
            {t("lecture.confirmed.educationalInstitutions")}
          </div>
        ),
        cell: ({ row }) => {
          const educationalInstitutions = row.getValue("educationalInstitutions") as string | undefined;
          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
              {educationalInstitutions || "-"}
            </div>
          );
        },
        meta: { width: 150 },
      },
      {
        accessorKey: "region",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.confirmed.region")}
          </div>
        ),
        cell: ({ row }) => {
          const region = row.getValue("region") as string | undefined;
          return (
            <div
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {region || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "gradeAndClass",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.confirmed.gradeAndClass")}
          </div>
        ),
        cell: ({ row }) => {
          const gradeAndClass = row.getValue("gradeAndClass") as string | undefined;
          return (
            <div
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {gradeAndClass || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "schedule",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("lecture.confirmed.schedule")}
          </div>
        ),
        cell: ({ row }) => {
          const schedule = row.getValue("schedule") as ConfirmedScheduleItem["schedule"];
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              <span>
                {schedule?.startDate ? formatDate(schedule.startDate) : "-"}{" "}
                - {schedule?.endDate ? formatDate(schedule.endDate) : "-"}
              </span>
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "work",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("lecture.confirmed.work")}
          </div>
        ),
        cell: () => {
          return (
            <div
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              <span
                className={cn(
                  "text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1"
                )}
              >
                <Eye className="h-4 w-4" />
                {t("lecture.confirmed.viewDetails")}
              </span>
            </div>
          );
        },
        meta: { width: 120 },
      },
    ],
    [t]
  );

  return (
    <>
      {/* Table Card with Search and Table */}
      <div className="px-4 py-5">
        <Card className="rounded-xl">
          {/* Search Bar */}
          <div className="p-4 pb-0">
            <Input
              type="text"
              placeholder={t("lecture.confirmed.searchPlaceholder")}
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
                data={schedules}
                columns={columns}
                emptyMessage={t("lecture.confirmed.noData")}
                getHeaderClassName={(headerId) => {
                  if (headerId === "actions") return "text-right";
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
            <CustomPagination
              total={paginationData.total}
              page={paginationData.page}
              size={paginationData.size}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
              onSizeChange={handleSizeChange}
            />
          </div>
        </Card>
      </div>
    </>
  );
};
