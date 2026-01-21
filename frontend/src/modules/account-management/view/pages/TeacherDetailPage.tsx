import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit } from "lucide-react";
import { PageLayout } from "@/app/layout/PageLayout";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/constants/routes";
import { useTeacherDetailQuery } from "../../controller/queries";
import { useMasterCodeChildrenByCodeQuery } from "@/modules/master-code-setup/controller/queries";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";

/**
 * Teacher Detail Page
 * Displays detailed information about a specific teacher
 */
export const TeacherDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const teacherId = id ? parseInt(id, 10) : 0;

  const {
    data: teacher,
    isLoading,
    error,
  } = useTeacherDetailQuery(teacherId);

  // Fetch status name if statusId exists
  const { data: statusMasterCodesData } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  );
  const statusMasterCodes = statusMasterCodesData?.items || [];
  const statusName = teacher?.statusId
    ? statusMasterCodes.find((s) => s.id === teacher.statusId)?.codeName
    : undefined;

  const handleBack = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !teacher) {
    return <ErrorState error={error || undefined} />;
  }

  return (
    <PageLayout
      title={t("accountManagement.teacherDetail")}
      customBreadcrumbRoot={{
        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL,
        label: t("accountManagement.teachers"),
      }}
      customBreadcrumbLast={teacher.name}
      actions={
        <>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <Button
            variant="default"
            onClick={() => navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL}/${teacherId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            {t('common.edit')}
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
                {teacher.teacherId || teacher.id}
              </div>
              <div
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                  teacher.enabled ? "bg-blue-500" : "bg-gray-500"
                )}
              >
                {statusName ||
                  (teacher.enabled
                    ? t("accountManagement.active")
                    : t("accountManagement.inactive"))}
              </div>
            </div>

            {/* Teacher Name */}
            <div>
              <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                {teacher.name}
              </h2>
            </div>

            {/* Account */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>
                {t("accountManagement.account")}: {teacher.username}
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
                    {t("accountManagement.teacherId")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {teacher.teacherId || teacher.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.account")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {teacher.username}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.name")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {teacher.name}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.email")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {teacher.email || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.phoneNumber")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {teacher.phone || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.status")}
                  </label>
                  <div className="mt-1">
                    {statusName ? (
                      <div
                        className={cn(
                          "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                          teacher.enabled ? "bg-blue-500" : "bg-gray-500"
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
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
