import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { InstructorScheduleListContent } from "../components/InstructorScheduleListContent";

/**
 * Instructor Schedule List Page
 * Layout wrapper with ErrorBoundary for the schedule list page
 */
export const InstructorScheduleListPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {t("lecture.schedule.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("lecture.schedule.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Content wrapped with ErrorBoundary */}
      <ErrorBoundary>
        <InstructorScheduleListContent />
      </ErrorBoundary>
    </div>
  );
};
