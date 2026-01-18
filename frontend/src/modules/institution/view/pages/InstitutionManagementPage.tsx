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
import { useInstitutionsQuery } from "../../controller/queries";
import type {
  Institution,
  InstitutionResponseDto,
} from "../../model/institution.types";
import { debounce } from "@/shared/lib/debounce";
import {
  InstitutionFilterDialog,
  type InstitutionFilterData,
} from "../components/InstitutionFilterDialog";
import { exportInstitutionsToExcel } from "../../model/institution.service";

/**
 * Actions Cell Component
 */
interface ActionsCellProps {
  institution: Institution;
  onDetail: (institution: Institution) => void;
}

const ActionsCell = ({ institution, onDetail }: ActionsCellProps) => {
  const { t } = useTranslation();

  const handleDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDetail(institution);
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
 * Map InstitutionResponseDto to Institution for table display
 * Maps address -> street and other fields to match table columns
 */
const mapInstitutionDtoToTable = (dto: InstitutionResponseDto): Institution => {
  return {
    id: dto.id,
    institutionId: dto.institutionId,
    institutionName: dto.name,
    address: dto.street, // Map street to address column
    detailAddress: dto.address, // Map address to detailAddress column
    phoneNumber: dto.phoneNumber,
    manager: dto.teacher?.name || "", // Extract teacher name from nested object
    email: "",
    website: "",
    status: "",
    region: "",
    city: "",
    postalCode: "",
    faxNumber: "",
    contactPerson: "",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

/**
 * Institution Management Page
 * Displays institution management interface
 */
export const InstitutionManagementPage = () => {
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
  const [isFilterDialogOpen, setIsFilterDialogOpen] =
    React.useState<boolean>(false);
  const [filters, setFilters] = React.useState<InstitutionFilterData>({});
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

  // Helper function to convert string array to number array
  const convertStringArrayToNumbers = (
    arr: string | string[] | undefined
  ): number[] | undefined => {
    if (!arr) return undefined;
    const arrAsArray = Array.isArray(arr) ? arr : [arr];
    if (arrAsArray.length === 0) return undefined;
    return arrAsArray.map((id) => Number(id)).filter((id) => !isNaN(id));
  };

  // Fetch institutions using React Query with debounced search and filters
  const { data: institutionsData, isLoading } = useInstitutionsQuery({
    q: debouncedSearchQuery || undefined,
    page,
    size,
    majorCategoryIds: convertStringArrayToNumbers(filters.majorCategory),
    categoryOneIds: convertStringArrayToNumbers(filters.category1),
    categoryTwoIds: convertStringArrayToNumbers(filters.category2),
    classificationIds: convertStringArrayToNumbers(
      filters.institutionLevelClassification
    ),
    zoneIds: convertStringArrayToNumbers(filters.zone),
    regionIds: convertStringArrayToNumbers(filters.region),
  });

  // Map DTOs to table format
  const institutions: Institution[] = React.useMemo(() => {
    if (!institutionsData?.items) return [];
    return institutionsData.items.map(mapInstitutionDtoToTable);
  }, [institutionsData]);

  // Extract pagination metadata
  const paginationData = React.useMemo(() => {
    if (!institutionsData) {
      return {
        total: 0,
        page: 0,
        size: size,
        totalPages: 0,
      };
    }
    return {
      total: institutionsData.total,
      page: institutionsData.page,
      size: institutionsData.size,
      totalPages: institutionsData.totalPages,
    };
  }, [institutionsData, size]);

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery, filters]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle size change
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  const handleFilterClick = () => {
    setIsFilterDialogOpen(true);
  };

  const handleFilterConfirm = (filterData: InstitutionFilterData) => {
    setFilters(filterData);
    setIsFilterDialogOpen(false);
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  const handleAddInstitution = () => {
    navigate(ROUTES.ADMIN_INSTITUTION_CREATE_FULL);
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);

      // Build export parameters from current filters
      const exportParams = {
        q: debouncedSearchQuery || undefined,
        majorCategoryIds: convertStringArrayToNumbers(filters.majorCategory),
        categoryOneIds: convertStringArrayToNumbers(filters.category1),
        categoryTwoIds: convertStringArrayToNumbers(filters.category2),
        classificationIds: convertStringArrayToNumbers(
          filters.institutionLevelClassification
        ),
        zoneIds: convertStringArrayToNumbers(filters.zone),
        regionIds: convertStringArrayToNumbers(filters.region),
        // Note: districtId and teacherId are not in filters, but can be added if needed
      };

      // Call export API
      const blob = await exportInstitutionsToExcel(exportParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `institutions_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting institutions:", error);
      // TODO: Show error toast/notification
    } finally {
      setIsExporting(false);
    }
  };

  const handleDetail = React.useCallback(
    (institution: Institution) => {
      navigate(`/admin/institution/${institution.id}/edit?mode=view`);
    },
    [navigate]
  );

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
              <ActionsCell institution={institution} onDetail={handleDetail} />
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
              {t("institution.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("institution.description")}
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
              {isExporting
                ? t("common.loading") || "Loading..."
                : t("institution.download")}
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
        <Card>
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={t("institution.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearchChange}
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
              enableRowSelection={true}
              enableColumnPinning={true}
              columnPinning={columnPinning}
              onColumnPinningChange={setColumnPinning}
              isLoading={isLoading}
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
      <InstitutionFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onConfirm={handleFilterConfirm}
      />
      <LoadingOverlay isLoading={isExporting} />
    </div>
  );
};
