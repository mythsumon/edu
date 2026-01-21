import * as React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Calendar, Users, Clock } from "lucide-react";
import { TrainingCard } from "@/modules/instructor-training/view/components/TrainingCard";
import { formatDate } from "@/shared/lib/date";
import { MOCK_ONGOING_TRAININGS } from "../model/ongoingTraining.mock";

/**
 * Ongoing Training List Content Component
 * Displays ongoing training courses in a card grid layout
 */
export const OngoingTrainingListContent = () => {
  const { t } = useTranslation();

  const handleAttendanceClick = React.useCallback((trainingId: number) => {
    // TODO: Navigate to attendance/confirmation page
    console.log("Navigate to attendance for training:", trainingId);
  }, []);

  return (
    <div className="px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-card rounded-xl p-6">
        {MOCK_ONGOING_TRAININGS.map((training) => (
          <TrainingCard
            key={training.id}
            title={training.trainingName}
            status={{
              label: t("lecture.ongoing.inProgress"),
              variant: "default",
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
              {
                icon: Clock,
                label: `${training.time.startTime} ~ ${training.time.endTime}`,
              },
            ]}
            actionButton={{
              label: t("lecture.ongoing.attendanceConfirmation"),
              onClick: () => handleAttendanceClick(training.id),
            }}
          />
        ))}
      </div>
    </div>
  );
};
