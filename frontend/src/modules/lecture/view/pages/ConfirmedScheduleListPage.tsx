import * as React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { StatsContainer } from "../components/StatsContainer";
import { ConfirmedScheduleListContent } from "../components/ConfirmedScheduleListContent";

/**
 * Confirmed Schedule List Page
 * Layout wrapper with ErrorBoundary for the confirmed schedule list page
 */
export const ConfirmedScheduleListPage = () => {
  const { t } = useTranslation();

  // Calculate stats - this should come from API/data in the future
  const stats = React.useMemo(() => {
    const total = 5; // Mock data count
    return [
      {
        title: t("lecture.confirmed.entire") || "entire",
        value: total,
        variant: "default" as const,
      },
    ];
  }, [t]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t("lecture.confirmed.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.confirmed.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Container */}
      <div className="px-4 py-5">
        <StatsContainer stats={stats} />
      </div>

      {/* Content wrapped with ErrorBoundary */}
      <ErrorBoundary>
        <ConfirmedScheduleListContent />
      </ErrorBoundary>
    </div>
  );
};
