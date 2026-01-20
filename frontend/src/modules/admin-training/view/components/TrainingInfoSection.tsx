import { useState, useMemo } from "react";
import { Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { FormField } from "./FormField";
import { FormDropdownField } from "./FormDropdownField";
import { FormDatePickerField } from "./FormDatePickerField";
import {
  useProgramsQuery,
  useMasterCodeChildrenQuery,
  useInstitutionsQuery,
} from "../../controller/queries";
import {
  MASTER_CODE_PARENT_CODES,
  MASTER_CODE_PROGRAM_STATUS_ACTIVE,
} from "@/shared/constants/master-code";
import { CreateAdminTrainingFormData } from "../../model/admin-training.schema";

interface TrainingInfoSectionProps {
  control: Control<CreateAdminTrainingFormData>;
  register: UseFormRegister<CreateAdminTrainingFormData>;
  watch: UseFormWatch<CreateAdminTrainingFormData>;
  errors: FieldErrors<CreateAdminTrainingFormData>;
  isSubmitting: boolean;
}

export const TrainingInfoSection = ({
  control,
  register,
  watch,
  errors,
  isSubmitting,
}: TrainingInfoSectionProps) => {
  const { t } = useTranslation();

  // Internal state for collapsible section
  const [isOpen, setIsOpen] = useState(true);

  // Watch start date to set min date for end date picker
  const startDateValue = watch("startDate");
  const startDateAsDate = useMemo(() => {
    if (!startDateValue || startDateValue.trim() === "") return undefined;
    const date = new Date(startDateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }, [startDateValue]);

  // Fetch program status master codes to find active status ID
  const { data: programStatusData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.PROGRAM_STATUS
  );
  const activeStatusId = useMemo(() => {
    const activeStatus = programStatusData?.items?.find(
      (status) => status.code === MASTER_CODE_PROGRAM_STATUS_ACTIVE
    );
    return activeStatus?.id;
  }, [programStatusData?.items]);

  // Fetch programs for dropdown - only active programs
  const { data: programsData } = useProgramsQuery(
    activeStatusId
      ? { page: 0, size: 1000, statusIds: [activeStatusId] }
      : { page: 0, size: 1000 }
  );
  const programOptions = useMemo(
    () =>
      programsData?.items?.map((program) => ({
        value: String(program.id),
        label: program.name,
      })) || [],
    [programsData?.items]
  );

  // Fetch institutions for dropdown
  const { data: institutionsData } = useInstitutionsQuery({
    page: 0,
    size: 1000,
  });
  const institutionOptions = useMemo(
    () =>
      institutionsData?.items?.map((institution) => ({
        value: String(institution.id),
        label: institution.name,
      })) || [],
    [institutionsData?.items]
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
    >
      <Card>
        <div className="px-4">
          <div className="flex flex-row justify-between items-start">
            <h2 className="text-lg font-medium">
              {t("training.trainingInformation")}
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
                <span className="sr-only">
                  {isOpen ? t("common.collapse") : t("common.expand")}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("training.trainingInformationDescription")}
          </p>
        </div>
        <CollapsibleContent className="px-4">
          {/* Training Name - Full width */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              id="trainingName"
              label={t("training.trainingNameLabel")}
              required
              error={errors.trainingName}
            >
              <Input
                id="trainingName"
                type="text"
                placeholder={t("training.trainingNamePlaceholder")}
                {...register("trainingName")}
                className={
                  errors.trainingName ? "ring-2 ring-destructive" : ""
                }
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Program and Institution - Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormDropdownField
              id="program"
              name="program"
              label={t("training.programLabel")}
              placeholder={t("training.programPlaceholder")}
              control={control}
              options={programOptions}
              error={errors.program}
              required
              disabled={isSubmitting}
            />
            <FormDropdownField
              id="institution"
              name="institution"
              label={t("training.institutionLabel")}
              placeholder={t("training.institutionPlaceholder")}
              control={control}
              options={institutionOptions}
              error={errors.institution}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description - Full width */}
          <div className="mt-4">
            <FormField
              id="description"
              label={t("training.descriptionLabel")}
              error={errors.description}
            >
              <Textarea
                id="description"
                placeholder={t("training.descriptionPlaceholder")}
                {...register("description")}
                className={
                  errors.description ? "ring-2 ring-destructive" : ""
                }
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Start Date and End Date - Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormDatePickerField
              id="startDate"
              name="startDate"
              label={t("training.startDateLabel")}
              placeholder={t("training.startDatePlaceholder")}
              control={control}
              error={errors.startDate}
              required
              disabled={isSubmitting}
            />
            <FormDatePickerField
              id="endDate"
              name="endDate"
              label={t("training.endDateLabel")}
              placeholder={t("training.endDatePlaceholder")}
              control={control}
              error={errors.endDate}
              required
              disabled={isSubmitting || !startDateAsDate}
              minDate={startDateAsDate}
            />
          </div>

          {/* Notes - Full width */}
          <div className="mt-4 pb-4">
            <FormField
              id="notes"
              label={t("training.notesLabel")}
              error={errors.notes}
            >
              <Textarea
                id="notes"
                placeholder={t("training.notesPlaceholder")}
                {...register("notes")}
                className={errors.notes ? "ring-2 ring-destructive" : ""}
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
