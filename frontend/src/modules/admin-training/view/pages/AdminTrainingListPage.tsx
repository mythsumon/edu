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
import { useAdminTrainingsQuery } from "../../controller/queries";
import type {
  AdminTraining,
  AdminTrainingResponseDto,
} from "../../model/admin-training.types";
import { debounce } from "@/shared/lib/debounce";
import { formatDateDot } from "@/shared/lib/date";

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
 * Map AdminTrainingResponseDto to AdminTraining for table display
 */
const mapTrainingDtoToTable = (dto: AdminTrainingResponseDto): AdminTraining => {
  return {
    id: dto.id,
    trainingId: dto.trainingId || "-",
    name: dto.name || "-",
    institutionName: dto.institution?.name || "-",
    grade: dto.grade || "-",
    classInfo: dto.classInfo || "-",
    startDate: dto.startDate ? formatDateDot(dto.startDate) : "-",
    endDate: dto.endDate ? formatDateDot(dto.endDate) : "-",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
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
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    React.useState<string>("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(20);

  // Filter state (will be used when filter dialog is implemented)
  const [filterCount] = React.useState<number>(0);

  // Debounce search query
  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setDebouncedSearchQuery(value);
      }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  // Fetch trainings using React Query with debounced search
  const { data: trainingsData } = useAdminTrainingsQuery({
    q: debouncedSearchQuery || undefined,
    page,
    size,
  });

  // Map DTOs to table format
  const trainings: AdminTraining[] = React.useMemo(() => {
    if (!trainingsData?.items) return [];
    return trainingsData.items.map(mapTrainingDtoToTable);
  }, [trainingsData]);

  // Extract pagination metadata
  const paginationData = React.useMemo(() => {
    if (!trainingsData) {
      return {
        total: 0,
        page: 0,
        size: size,
        totalPages: 0,
      };
    }
    return {
      total: trainingsData.total,
      page: trainingsData.page,
      size: trainingsData.size,
      totalPages: trainingsData.totalPages,
    };
  }, [trainingsData, size]);

  // Reset to first page when search changes
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery]);

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

  const handleDetail = React.useCallback(
    (training: AdminTraining) => {
      navigate(`/admin/training/${training.id}/edit?mode=view`);
    },
    [navigate]
  );

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
        accessorKey: "institutionName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("training.institution")}
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
        accessorKey: "grade",
        header: () => (
          <div style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
            {t("training.grade")}
          </div>
        ),
        cell: ({ row }) => {
          const grade = row.getValue("grade") as string | undefined;
          return (
            <div
              style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}
            >
              {grade || "-"}
            </div>
          );
        },
        meta: { width: 100 },
      },
      {
        accessorKey: "classInfo",
        header: () => (
          <div style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}>
            {t("training.classInfo")}
          </div>
        ),
        cell: ({ row }) => {
          const classInfo = row.getValue("classInfo") as string | undefined;
          return (
            <div
              style={{ width: "100px", minWidth: "100px", maxWidth: "100px" }}
            >
              {classInfo || "-"}
            </div>
          );
        },
        meta: { width: 100 },
      },
      {
        accessorKey: "startDate",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("training.startDateLabel")}
          </div>
        ),
        cell: ({ row }) => {
          const startDate = row.getValue("startDate") as string | undefined;
          return (
            <div
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {startDate || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "endDate",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("training.endDateLabel")}
          </div>
        ),
        cell: ({ row }) => {
          const endDate = row.getValue("endDate") as string | undefined;
          return (
            <div
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {endDate || "-"}
            </div>
          );
        },
        meta: { width: 120 },
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
