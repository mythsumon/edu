import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { FormField } from "./FormField";
import { FormDatePickerField } from "./FormDatePickerField";
import { FormTimePickerField } from "./FormTimePickerField";
import { CreateAdminTrainingFormData } from "../../model/admin-training.schema";

interface PeriodCardProps {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  control: Control<CreateAdminTrainingFormData>;
  register: UseFormRegister<CreateAdminTrainingFormData>;
  errors: FieldErrors<CreateAdminTrainingFormData>;
  isSubmitting: boolean;
  minDate?: Date;
  maxDate?: Date;
  getOrdinalSuffix: (n: number) => string;
}

export const PeriodCard = ({
  index,
  isOpen,
  onToggle,
  control,
  register,
  errors,
  isSubmitting,
  minDate,
  maxDate,
  getOrdinalSuffix,
}: PeriodCardProps) => {
  const { t } = useTranslation();

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="py-0 pb-2 overflow-hidden space-y-0 border border-border/50 bg-background rounded-lg shadow-none">
        <CollapsibleTrigger asChild className="mt-2">
          <button
            type="button"
            className="w-full flex flex-row justify-between items-center pt-2 pb-2 px-0 transition-colors cursor-pointer"
          >
            <h3 className="text-sm font-normal">
              {t("training.periodTitle", {
                periodNumber: getOrdinalSuffix(index + 1),
              })}
            </h3>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border/50 mt-0 pt-2 pb-2 px-1">
          <div className="space-y-4">
            {/* Date - Full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormDatePickerField
                id={`periods.${index}.date`}
                name={`periods.${index}.date`}
                label={t("training.periodDateLabel")}
                placeholder={t("training.periodDatePlaceholder")}
                control={control}
                error={errors.periods?.[index]?.date}
                required
                disabled={isSubmitting}
                minDate={minDate}
                maxDate={maxDate}
                showTodayButton={false}
              />
            </div>

            {/* Start Time and End Time - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTimePickerField
                id={`periods.${index}.startTime`}
                name={`periods.${index}.startTime`}
                label={t("training.periodStartTimeLabel")}
                placeholder={t("training.periodStartTimePlaceholder")}
                control={control}
                error={errors.periods?.[index]?.startTime}
                required
                disabled={isSubmitting}
              />
              <FormTimePickerField
                id={`periods.${index}.endTime`}
                name={`periods.${index}.endTime`}
                label={t("training.periodEndTimeLabel")}
                placeholder={t("training.periodEndTimePlaceholder")}
                control={control}
                error={errors.periods?.[index]?.endTime}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Main and Assistant Lecturers - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id={`periods.${index}.mainLecturers`}
                label={t("training.mainLecturersLabel")}
                required
                error={errors.periods?.[index]?.mainLecturers}
              >
                <Input
                  id={`periods.${index}.mainLecturers`}
                  type="number"
                  placeholder={t("training.mainLecturersPlaceholder")}
                  {...register(`periods.${index}.mainLecturers`, {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.periods?.[index]?.mainLecturers
                      ? "ring-2 ring-destructive"
                      : ""
                  }
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField
                id={`periods.${index}.assistantLecturers`}
                label={t("training.assistantLecturersLabel")}
                required
                error={errors.periods?.[index]?.assistantLecturers}
              >
                <Input
                  id={`periods.${index}.assistantLecturers`}
                  type="number"
                  placeholder={t("training.assistantLecturersPlaceholder")}
                  {...register(`periods.${index}.assistantLecturers`, {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.periods?.[index]?.assistantLecturers
                      ? "ring-2 ring-destructive"
                      : ""
                  }
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
