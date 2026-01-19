import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Eye, Search, Filter } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ColumnPinningState } from "@tanstack/react-table";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Card } from "@/shared/ui/card";
import { DataTable } from "@/shared/components/DataTable";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { ROUTES } from "@/shared/constants/routes";
import { useProgramsQuery } from "../../controller/queries";
import type { Program, ProgramResponseDto, ProgramFilterData } from "../../model/program.types";
import { exportProgramsToExcel } from "../../model/program.service";
import { debounce } from "@/shared/lib/debounce";
import { formatDateDot } from "@/shared/lib/date";
import { ProgramFilterDialog } from "../components/ProgramFilterDialog";

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  program: Program;
  onDetail: (program: Program) => void;
}

const ActionsCell = ({ program, onDetail }: ActionsCellProps) => {
  const { t } = useTranslation();

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDetail(program);
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
 * Map ProgramResponseDto to Program for table display
 */
const mapProgramDtoToTable = (dto: ProgramResponseDto): Program => {
  return {
    id: dto.id,
    programId: dto.programId || dto.id.toString(),
    programName: dto.name,
    sessionPart: dto.sessionPart?.codeName || "",
    status: dto.status?.codeName || "",
    programType: dto.programType?.codeName || "",
    notes: dto.notes || "",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

/**
 * Program List Page
 * Displays program management interface
 */
export const ProgramListPage = () => {
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

  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<ProgramFilterData>({});

  // Export state
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

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

  // Handle filter confirm
  const handleFilterConfirm = (filterData: ProgramFilterData) => {
    setFilters(filterData);
    setPage(0); // Reset to first page when filters change
    setIsFilterDialogOpen(false);
  };

  // Build statusIds array from filter
  const statusIds = React.useMemo(() => {
    if (!filters.status || filters.status.length === 0) return undefined;
    return filters.status.map((id) => Number(id));
  }, [filters.status]);

  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (filters.status && filters.status.length > 0) || false;
  }, [filters]);

  // Fetch programs using React Query with debounced search
  const { data: programsData } = useProgramsQuery({
    q: debouncedSearchQuery || undefined,
    page,
    size,
    statusIds,
  });

  // Map DTOs to table format
  const programs: Program[] = React.useMemo(() => {
    if (!programsData?.items) return [];
    return programsData.items.map(mapProgramDtoToTable);
  }, [programsData]);

  // Extract pagination metadata
  const paginationData = React.useMemo(() => {
    if (!programsData) {
      return {
        total: 0,
        page: 0,
        size: size,
        totalPages: 0,
      };
    }
    return {
      total: programsData.total,
      page: programsData.page,
      size: programsData.size,
      totalPages: programsData.totalPages,
    };
  }, [programsData, size]);

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
    setPage(0); // Reset to first page when size changes
  };

  const handleAddProgram = () => {
    navigate(ROUTES.ADMIN_PROGRAM_CREATE_FULL);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);

      // Build export parameters from current filters
      const exportParams = {
        q: debouncedSearchQuery || undefined,
        statusIds: statusIds,
      };

      // Call export API
      const blob = await exportProgramsToExcel(exportParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `programs_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting programs:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetail = React.useCallback(
    (program: Program) => {
      navigate(`/admin/program/${program.id}/edit?mode=view`);
    },
    [navigate]
  );

  const columns = React.useMemo<ColumnDef<Program>[]>(
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
              aria-label={t("program.selectAll")}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div style={{ width: "50px", minWidth: "50px", maxWidth: "50px" }}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`${t("program.selectRow")} ${
                row.original.programName
              }`}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { width: 50 },
      },
      {
        accessorKey: "programId",
        header: () => (
          <div style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}>
            {t("program.programId")}
          </div>
        ),
        cell: ({ row }) => {
          const programId = row.getValue("programId") as string | undefined;
          return (
            <div
              className="font-medium"
              style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }}
            >
              {programId || "-"}
            </div>
          );
        },
        meta: { width: 120 },
      },
      {
        accessorKey: "programName",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("program.programName")}
          </div>
        ),
        cell: ({ row }) => {
          const programName = row.getValue("programName") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {programName || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "status",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("program.status")}
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
        accessorKey: "notes",
        header: () => (
          <div style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}>
            {t("program.notes")}
          </div>
        ),
        cell: ({ row }) => {
          const notes = row.getValue("notes") as string | undefined;
          return (
            <div
              style={{ width: "200px", minWidth: "200px", maxWidth: "200px" }}
            >
              {notes || "-"}
            </div>
          );
        },
        meta: { width: 200 },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <div style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}>
            {t("program.registrationDate")}
          </div>
        ),
        cell: ({ row }) => {
          const createdAt = row.getValue("createdAt") as string | undefined;
          return (
            <div
              style={{ width: "150px", minWidth: "150px", maxWidth: "150px" }}
            >
              {createdAt ? formatDateDot(createdAt) : "-"}
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
            {t("program.actions")}
          </div>
        ),
        cell: ({ row }) => {
          const program = row.original;
          return (
            <div style={{ width: "80px", minWidth: "80px", maxWidth: "80px" }}>
              <ActionsCell program={program} onDetail={handleDetail} />
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
              {t("program.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("program.description")}
            </p>
          </div>
          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
              {isExporting ? t("common.exporting") : t("program.download")}
            </Button>
            <Button onClick={handleAddProgram}>
              <Plus className="h-4 w-4" />
              {t("program.addProgram")}
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
                placeholder={t("program.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearchChange}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterDialogOpen(true)}
              className={hasActiveFilters ? "border-primary text-primary" : ""}
            >
              <Filter className="h-4 w-4" />
              {t("program.filter")}
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 justify-center items-center flex text-xs bg-badge text-primary rounded-full">
                  {filters.status?.length || 0}
                </span>
              )}
            </Button>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <DataTable
              data={programs}
              columns={columns}
              emptyMessage={t("program.noData")}
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
      <LoadingOverlay isLoading={isExporting} />

      {/* Filter Dialog */}
      <ProgramFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onConfirm={handleFilterConfirm}
      />
    </div>
  );
};
