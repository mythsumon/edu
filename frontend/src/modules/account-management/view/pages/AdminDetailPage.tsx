import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@/app/layout/PageLayout";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { cn } from "@/shared/lib/cn";
import { ROUTES } from "@/shared/constants/routes";
import { useAdminDetailQuery } from "../../controller/queries";

/**
 * Admin Detail Page
 * Displays detailed information about a specific admin
 */
export const AdminDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const adminId = id ? parseInt(id, 10) : 0;

  const {
    data: admin,
    isLoading,
    error,
  } = useAdminDetailQuery(adminId);

  const handleBack = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !admin) {
    return <ErrorState error={error || undefined} />;
  }

  return (
    <PageLayout
      title={t("accountManagement.adminDetail")}
      customBreadcrumbRoot={{
        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL,
        label: t("accountManagement.admins"),
      }}
      actions={
        <>
          <Button
            variant="default"
            onClick={() => navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL}/${adminId}/edit`)}
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
                {admin.id}
              </div>
              <div
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white",
                  admin.enabled ? "bg-blue-500" : "bg-gray-500"
                )}
              >
                {admin.enabled
                  ? t("accountManagement.active")
                  : t("accountManagement.inactive")}
              </div>
            </div>

            {/* Admin Name */}
            <div>
              <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                {admin.name}
              </h2>
            </div>

            {/* Account */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>
                {t("accountManagement.account")}: {admin.username}
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
                    {t("accountManagement.adminId")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {admin.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.account")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {admin.username}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.name")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {admin.name}
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
                    {admin.email || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("accountManagement.phoneNumber")}
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {admin.phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
