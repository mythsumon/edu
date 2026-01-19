import * as React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Calendar, Users } from "lucide-react";
import { TrainingCard } from "@/modules/training/view/components/TrainingCard";
import { formatDate } from "@/shared/lib/date";
import { MOCK_COMPLETED_TRAININGS } from "../model/completedTraining.mock";

/**
 * Completed Training List Content Component
 * Displays completed training courses in a card grid layout
 */
export const CompletedTrainingListContent = () => {
  const { t } = useTranslation();

  const handleReviewsClick = React.useCallback((trainingId: number) => {
    // TODO: Navigate to reviews/settlement page
    console.log("Navigate to reviews/settlement for training:", trainingId);
  }, []);

  return (
    <div className="px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-card rounded-xl p-6">
        {MOCK_COMPLETED_TRAININGS.map((training) => (
          <TrainingCard
            key={training.id}
            title={training.trainingName}
            status={{
              label: t("lecture.completed.complete"),
              variant: "success",
            }}
            details={[
              {
                icon: MapPin,
                label: training.institutionName,
              },
              {
                icon: Calendar,
                label: `${formatDate(training.schedule.startDate)} - ${formatDate(
                  training.schedule.endDate
                )}`,
              },
              {
                icon: Users,
                label: training.gradeAndClass,
              },
            ]}
            summary={{
              label: t("lecture.completed.trainingSummary"),
            }}
            actionButton={{
              label: t("lecture.completed.reviewsSettlement"),
              onClick: () => handleReviewsClick(training.id),
              variant: "outline",
            }}
          />
        ))}
      </div>
    </div>
  );
};
