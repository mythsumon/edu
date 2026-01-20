import * as React from "react";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { StatsContainer } from "../components/StatsContainer";
import { ApplyForLectureListContent } from "../components/ApplyForLectureListContent";
import { MOCK_TRAINING_SESSIONS } from "../components/trainingSessionForApplication.mock";

/**
 * Apply For Lecture List Page
 * Layout wrapper with ErrorBoundary for the apply for lecture page
 */
export const ApplyForLectureListPage = () => {
  const { t } = useTranslation();

  // Calculate stats - this should come from API/data in the future
  const stats = React.useMemo(() => {
    const total = MOCK_TRAINING_SESSIONS.length;
    const today = new Date();
    const available = MOCK_TRAINING_SESSIONS.filter((session) => {
      const endDate = new Date(session.period.endDate);
      return endDate >= today;
    }).length;
    const deadline = MOCK_TRAINING_SESSIONS.filter((session) => {
      const endDate = new Date(session.period.endDate);
      return endDate < today;
    }).length;

    return [
      {
        title: t("lecture.apply.stats.entire") || "entire",
        value: total,
        variant: "default" as const,
      },
      {
        title: t("lecture.apply.stats.applicationAvailable") || "Application available",
        value: available,
        variant: "primary" as const,
      },
      {
        title: t("lecture.apply.stats.deadline") || "Deadline",
        value: deadline,
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
              {t("lecture.apply.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.apply.description")}
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
        <ApplyForLectureListContent />
      </ErrorBoundary>
    </div>
  );
};
