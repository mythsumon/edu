import * as React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { StatsContainer } from "../components/StatsContainer";
import { UpcomingTrainingListContent } from "../components/UpcomingTrainingListContent";
import { MOCK_UPCOMING_TRAININGS } from "../components/upcomingTraining.mock";

/**
 * Upcoming Training List Page
 * Layout wrapper with ErrorBoundary for the upcoming training list page
 */
export const UpcomingTrainingListPage = () => {
  const { t } = useTranslation();

  // Calculate stats - this should come from API/data in the future
  const stats = React.useMemo(() => {
    const total = MOCK_UPCOMING_TRAININGS.length;

    return [
      {
        title: t("lecture.upcoming.stats.entire") || "entire",
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
              {t("lecture.upcoming.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.upcoming.description")}
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
        <UpcomingTrainingListContent />
      </ErrorBoundary>
    </div>
  );
};
