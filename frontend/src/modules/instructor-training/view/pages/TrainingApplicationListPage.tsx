import * as React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { StatsContainer } from "../components/StatsContainer";
import { TrainingApplicationListContent } from "../components/TrainingApplicationListContent";
import { MOCK_TRAINING_APPLICATIONS } from "../components/trainingApplication.mock";

/**
 * Training Application List Page
 * Layout wrapper with ErrorBoundary for the training application list page
 */
export const TrainingApplicationListPage = () => {
  const { t } = useTranslation();

  // Calculate stats - this should come from API/data in the future
  const stats = React.useMemo(() => {
    const total = MOCK_TRAINING_APPLICATIONS.length;
    const confirmed = MOCK_TRAINING_APPLICATIONS.filter(
      (item) => item.situation === "confirmed"
    ).length;
    const atmosphere = MOCK_TRAINING_APPLICATIONS.filter(
      (item) => item.situation === "atmosphere"
    ).length;
    const rejected = MOCK_TRAINING_APPLICATIONS.filter(
      (item) => item.situation === "rejected" || item.situation === "deleted"
    ).length;

    return [
      {
        title: t("lecture.application.stats.entire") || "entire",
        value: total,
        variant: "default" as const,
      },
      {
        title: t("lecture.application.stats.confirmed") || "Confirmed",
        value: confirmed,
        variant: "success" as const,
      },
      {
        title: t("lecture.application.stats.atmosphere") || "atmosphere",
        value: atmosphere,
        variant: "primary" as const,
      },
      {
        title: t("lecture.application.stats.rejectDelete") || "Reject/Delete",
        value: rejected,
        variant: "destructive" as const,
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
              {t("lecture.application.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.application.description")}
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
        <TrainingApplicationListContent />
      </ErrorBoundary>
    </div>
  );
};
