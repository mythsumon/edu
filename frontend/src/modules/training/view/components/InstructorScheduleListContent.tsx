import * as React from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter } from "lucide-react";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { StatsContainer } from "../components/StatsContainer";
import { TabContainer, type TabConfig } from "./TabsContainer";
import { ScheduleTable } from "./ScheduleTable";
import type { ScheduleItem } from "../../model/training.types";

// Mock data
const MOCK_SCHEDULES: ScheduleItem[] = [
  {
    id: 1,
    educationId: 3,
    trainingName: "Introduction to Robotics",
    institutionName: "Incheon High School",
    documentStatus: [
      { type: "pending", name: "Attendance sheet", count: 1 },
      { type: "pending", name: "Activity log", count: 1 },
      { type: "pending", name: "Parish Confirmation", count: 1 },
      { type: "missing", name: "Supporting materials" },
    ],
    overallStatus: "atmosphere",
    lastModifiedDate: "2026-01-19T13:12:00Z",
    management: "particular",
  },
  {
    id: 2,
    educationId: 4,
    trainingName: "Advanced React Development",
    institutionName: "Seoul Tech Academy",
    documentStatus: [
      { type: "pending", name: "Attendance sheet", count: 1 },
      { type: "completed", name: "Activity log" },
      { type: "completed", name: "Parish Confirmation" },
      { type: "completed", name: "Supporting materials" },
    ],
    overallStatus: "confirmed",
    lastModifiedDate: "2026-01-18T10:30:00Z",
    management: "view",
  },
  {
    id: 3,
    educationId: 5,
    trainingName: "TypeScript Fundamentals",
    institutionName: "Busan Education Center",
    documentStatus: [
      { type: "pending", name: "Attendance sheet", count: 2 },
      { type: "pending", name: "Activity log", count: 1 },
      { type: "missing", name: "Parish Confirmation" },
      { type: "missing", name: "Supporting materials" },
    ],
    overallStatus: "pending",
    lastModifiedDate: "2026-01-17T14:20:00Z",
    management: "particular",
  },
  {
    id: 4,
    educationId: 6,
    trainingName: "Node.js Backend Development",
    institutionName: "Incheon Learning Hub",
    documentStatus: [
      { type: "completed", name: "Attendance sheet" },
      { type: "completed", name: "Activity log" },
      { type: "completed", name: "Parish Confirmation" },
      { type: "completed", name: "Supporting materials" },
    ],
    overallStatus: "completed",
    lastModifiedDate: "2026-01-16T09:15:00Z",
    management: "view",
  },
  {
    id: 5,
    educationId: 7,
    trainingName: "Vue.js Complete Guide",
    institutionName: "Daegu Tech Institute",
    documentStatus: [
      { type: "pending", name: "Attendance sheet", count: 1 },
      { type: "missing", name: "Activity log" },
      { type: "missing", name: "Parish Confirmation" },
      { type: "missing", name: "Supporting materials" },
    ],
    overallStatus: "incomplete",
    lastModifiedDate: "2026-01-15T16:45:00Z",
    management: "particular",
  },
];

/**
 * Instructor Schedule List Content Component
 * Contains the main content logic for the schedule list
 */
export const InstructorScheduleListContent = () => {
  const { t } = useTranslation();

  // Column pinning state
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: [],
  });

  // Tab state
  const [activeTab, setActiveTab] = React.useState<string>("all");

  // Search and pagination state - separate for each tab
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(20);

  // Get filtered data for a specific tab
  const getFilteredDataForTab = React.useCallback(
    (tabValue: string) => {
      let filtered: ScheduleItem[];
      if (tabValue === "all") {
        filtered = MOCK_SCHEDULES;
      } else if (tabValue === "confirmed") {
        // Include both "confirmed" and "atmosphere" statuses
        filtered = MOCK_SCHEDULES.filter(
          (schedule) =>
            schedule.overallStatus.toLowerCase() === "confirmed" ||
            schedule.overallStatus.toLowerCase() === "atmosphere"
        );
      } else if (tabValue === "cancelled") {
        // Map "cancelled" to "incomplete"
        filtered = MOCK_SCHEDULES.filter(
          (schedule) => schedule.overallStatus.toLowerCase() === "incomplete"
        );
      } else {
        filtered = MOCK_SCHEDULES.filter(
          (schedule) => schedule.overallStatus.toLowerCase() === tabValue.toLowerCase()
        );
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (schedule) =>
            schedule.educationId.toString().includes(query) ||
            schedule.trainingName.toLowerCase().includes(query) ||
            schedule.institutionName.toLowerCase().includes(query) ||
            schedule.overallStatus.toLowerCase().includes(query)
        );
      }

      return filtered;
    },
    [searchQuery]
  );

  // Reset page when tab changes
  React.useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // Calculate stats from mock data
  const stats = React.useMemo(() => {
    const total = MOCK_SCHEDULES.length;
    const pending = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "pending").length;
    const confirmed = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "confirmed" || s.overallStatus.toLowerCase() === "atmosphere").length;
    const cancelled = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "incomplete").length;

    return [
      {
        title: t("lecture.schedule.stats.entire") || "Entire",
        value: total,
        variant: "default" as const,
      },
      {
        title: t("lecture.schedule.stats.pendingApproval") || "Pending approval",
        value: pending,
        variant: "primary" as const,
      },
      {
        title: t("lecture.schedule.stats.approvalComplete") || "Approval complete",
        value: confirmed,
        variant: "success" as const,
      },
      {
        title: t("lecture.schedule.stats.cancelled") || "Cancelled",
        value: cancelled,
        variant: "destructive" as const,
      },
    ];
  }, [t]);

  // Handle search change
  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
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

  // Calculate tab counts
  const tabCounts = React.useMemo(() => {
    const all = MOCK_SCHEDULES.length;
    const pending = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "pending").length;
    const confirmed = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "confirmed" || s.overallStatus.toLowerCase() === "atmosphere").length;
    const cancelled = MOCK_SCHEDULES.filter((s) => s.overallStatus.toLowerCase() === "incomplete").length;
    return { all, pending, confirmed, cancelled };
  }, []);

  // Tab configurations with dynamic content
  const tabConfigs: TabConfig[] = React.useMemo(() => {
    const createTableContentForTab = (tabValue: string) => {
      const filteredData = getFilteredDataForTab(tabValue);
      const paginatedData = filteredData.slice(page * size, (page + 1) * size);
      const total = filteredData.length;
      const totalPages = Math.ceil(total / size);

      return (
        <ScheduleTable
          data={paginatedData}
          paginationData={{
            total,
            page,
            size,
            totalPages,
          }}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          columnPinning={columnPinning}
          onColumnPinningChange={setColumnPinning}
        />
      );
    };

    return [
      {
        value: "all",
        label: (
          <>
            {t("lecture.schedule.tabs.all") || "All"} ({tabCounts.all})
          </>
        ),
        content: createTableContentForTab("all"),
      },
      {
        value: "pending",
        label: (
          <>
            {t("lecture.schedule.tabs.ongoing") || "Ongoing training"} ({tabCounts.pending})
          </>
        ),
        content: createTableContentForTab("pending"),
      },
      {
        value: "confirmed",
        label: (
          <>
            {t("lecture.schedule.tabs.confirmed") || "Check confirmed classes"} ({tabCounts.confirmed})
          </>
        ),
        content: createTableContentForTab("confirmed"),
      },
      {
        value: "incomplete",
        label: (
          <>
            {t("lecture.schedule.tabs.completed") || "Completed training"} ({tabCounts.cancelled})
          </>
        ),
        content: createTableContentForTab("incomplete"),
      },
    ];
  }, [
    t,
    tabCounts,
    getFilteredDataForTab,
    page,
    size,
    handlePageChange,
    handleSizeChange,
    columnPinning,
    setColumnPinning,
  ]);

  return (
    <>
      {/* Stats Container */}
      <div className="px-4 py-5">
        <StatsContainer stats={stats} />
      </div>

      {/* Content Area with Card, Filter, Tabs, and Table */}
      <div className="px-4">
        <Card>
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4 p-4 pb-0">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t("lecture.schedule.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearchChange}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              {t("common.filter")}
            </Button>
          </div>

          {/* Tabs Container - Under Filter Bar, contains table dynamically */}
          <div className="px-4 pt-0">
            <TabContainer
              tabs={tabConfigs}
              currentValue={activeTab}
              defaultValue="all"
              onValueChange={setActiveTab}
              className="w-full"
            />
          </div>
        </Card>
      </div>
    </>
  );
};
