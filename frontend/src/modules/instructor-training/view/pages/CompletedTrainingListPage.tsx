import * as React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { StatsContainer } from "../components/StatsContainer";
import { CompletedTrainingListContent } from "../components/CompletedTrainingListContent";
import { MOCK_COMPLETED_TRAININGS } from "../model/completedTraining.mock";

/**
 * Completed Training List Page
 * Layout wrapper with ErrorBoundary for the completed training list page
 */
export const CompletedTrainingListPage = () => {
  const { t } = useTranslation();

  // Calculate stats - this should come from API/data in the future
  const stats = React.useMemo(() => {
    const total = MOCK_COMPLETED_TRAININGS.length;
    return [
      {
        title: t("lecture.completed.entire") || "entire",
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
              {t("lecture.completed.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.completed.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Container */}
      <div className="px-4 py-2">
        <StatsContainer stats={stats} />
      </div>

      {/* Content wrapped with ErrorBoundary */}
      <ErrorBoundary>
        <CompletedTrainingListContent />
      </ErrorBoundary>
    </div>
  );
};
