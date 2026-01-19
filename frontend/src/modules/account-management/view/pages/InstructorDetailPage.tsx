import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/app/layout/PageLayout";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/lib/cn";
import { formatDateDot } from "@/shared/lib/date";
import { ROUTES } from "@/shared/constants/routes";
import { useInstructorDetailQuery } from "../../controller/queries";
import { useCommonCodeByIdQuery } from "@/modules/common-code/controller/queries";
import { useMasterCodeChildrenByCodeQuery } from "@/modules/master-code-setup/controller/queries";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import { GENDER_OPTIONS } from "@/shared/constants/users";

/**
 * Instructor Detail Page
 * Displays detailed information about a specific instructor
 */
export const InstructorDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const instructorId = id ? parseInt(id, 10) : 0;

  const {
    data: instructor,
    isLoading,
    error,
  } = useInstructorDetailQuery(instructorId);

  // Fetch region name if regionId exists
  const { data: regionData } = useCommonCodeByIdQuery(
    instructor?.regionId,
    !!instructor?.regionId
  );

  // Fetch zone name if region has parentId
  const { data: zoneData } = useCommonCodeByIdQuery(
    regionData?.parentId ?? undefined,
    !!regionData?.parentId
  );

  // Fetch classification name if classificationId exists
  const { data: classificationData } = useCommonCodeByIdQuery(
    instructor?.classificationId,
    !!instructor?.classificationId
  );

  // Fetch status name if statusId exists
  const { data: statusMasterCodesData } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  );
  const statusMasterCodes = statusMasterCodesData?.items || [];
  const statusName = instructor?.statusId
    ? statusMasterCodes.find((s) => s.id === instructor.statusId)?.codeName
    : undefined;

  const regionName = regionData?.codeName;
  const zoneName = zoneData?.codeName;
  const classificationName = classificationData?.codeName;

  // Format date of birth
  const formatDateOfBirth = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return formatDateDot(dateString);
    } catch {
      return dateString;
    }
  };

  // Get gender label
  const getGenderLabel = (gender?: string) => {
    if (!gender) return "-";
    const genderOption = GENDER_OPTIONS.find((opt) => opt.value === gender);
    return genderOption?.label || gender;
  };

  const handleBack = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !instructor) {
    return <ErrorState error={error || undefined} />;
  }

  return (
    <PageLayout
      title={t("accountManagement.instructorDetail")}
      customBreadcrumbRoot={{
        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL,
        label: t("accountManagement.instructors"),
      }}
      actions={
        <>
          <Button
            variant="default"
            onClick={() => navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL}/${instructorId}/edit`)}
          >
            {t('common.edit')}
          </Button>
          <Button variant="outline" onClick={handleBack}>
            {t('common.back')}
          </Button>
        </>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        {/* Summary Header Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm">
          <div className="flex flex-col space-y-4">
            {/* Top row: ID and Status pills */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                {instructor.id}
              </div>
              <div
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                  instructor.enabled ? "bg-blue-500" : "bg-gray-500"
                )}
              >
                {statusName ||
                  (instructor.enabled
                    ? t("accountManagement.active")
                    : t("accountManagement.inactive"))}
              </div>
            </div>

            {/* Instructor Name */}
            <div>
              <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                {instructor.name}
              </h2>
            </div>

            {/* Account */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>
                {t("accountManagement.account")}: {instructor.username}
              </span>
            </div>
          </div>
        </Card>

        {/* Basic Information Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b-2 border-blue-500 pb-2 inline-block">
                {t("accountManagement.basicInformation")}
              </h3>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.instructorId")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.account")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.username}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.name")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.email")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.email || "-"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.phoneNumber")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.phone || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.gender")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {getGenderLabel(instructor.gender)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.dateOfBirth")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {formatDateOfBirth(instructor.dob)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b-2 border-blue-500 pb-2 inline-block">
                {t("accountManagement.addressInformation")}
              </h3>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.affiliation")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.affiliation || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.city")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.city || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.zone")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {zoneName || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.region")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {regionName || "-"}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.street")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.street || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.buildingNameLakeNumber")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.detailAddress || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status and Classification Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b-2 border-blue-500 pb-2 inline-block">
                {t("accountManagement.statusAndClassification")}
              </h3>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.status")}
                  </label>
                  <div className="mt-1">
                    {statusName ? (
                      <div
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                          instructor.enabled ? "bg-blue-500" : "bg-gray-500"
                        )}
                      >
                        {statusName}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.instructorClassification")}
                  </label>
                  <div className="mt-1">
                    {classificationName ? (
                      <div
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                          classificationName.toLowerCase().includes("common") ||
                            classificationName.toLowerCase().includes("일반")
                            ? "bg-blue-500"
                            : classificationName
                                .toLowerCase()
                                .includes("advanced") ||
                              classificationName.toLowerCase().includes("고급")
                            ? "bg-purple-500"
                            : classificationName
                                .toLowerCase()
                                .includes("preparation") ||
                              classificationName.toLowerCase().includes("준비")
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        )}
                      >
                        {classificationName}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
