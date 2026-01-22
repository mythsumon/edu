import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "react-i18next";
import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrainingInfoSection } from "../components/TrainingInfoSection";
import { SchoolInfoSection } from "../components/SchoolInfoSection";
import { ClassInfoSection } from "../components/ClassInfoSection";
import {
  createAdminTrainingSchema,
  type CreateAdminTrainingFormData,
} from "../../model/admin-training.schema";
import { useCreateAdminTraining, useCreatePeriodsBulk } from "../../controller/mutations";
import { useToast } from "@/shared/ui/use-toast";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import type { AdminTrainingCreateDto, PeriodBulkCreateDto } from "../../model/admin-training.types";

export const AdminTrainingCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for table validation errors
  const [hasTableValidationErrors, setHasTableValidationErrors] = useState(false);

  // Mutations
  const createTrainingMutation = useCreateAdminTraining();
  const createPeriodsBulkMutation = useCreatePeriodsBulk();

  const {
    register,
    handleSubmit,
    control,
    watch,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminTrainingFormData>({
    resolver: zodResolver(createAdminTrainingSchema(t)),
    mode: "onChange",
    defaultValues: {
      trainingName: "",
      program: "",
      institution: "",
      description: "",
      startDate: "",
      endDate: "",
      notes: "",
      grade: "",
      class: "",
      numberOfStudents: undefined,
      numberOfPeriods: 1,
      periods: [
        {
          date: "",
          startTime: "",
          endTime: "",
          mainLecturers: undefined as unknown as number,
          assistantLecturers: undefined as unknown as number,
        },
      ],
    },
  });

  // Field array for periods
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "periods",
  });

  // Watch number of periods to sync periods array
  const numberOfPeriodsValue = watch("numberOfPeriods");
  const periodCount = useMemo(() => {
    if (!numberOfPeriodsValue || numberOfPeriodsValue < 1) return 0;
    return Math.min(numberOfPeriodsValue, 100); // Cap at 100 for safety
  }, [numberOfPeriodsValue]);

  // Sync periods array with numberOfPeriods
  useEffect(() => {
    const currentLength = fields.length;
    const targetLength = periodCount;

    if (targetLength > currentLength) {
      // Add new periods
      for (let i = currentLength; i < targetLength; i++) {
        append({
          date: "",
          startTime: "",
          endTime: "",
          mainLecturers: undefined as unknown as number,
          assistantLecturers: undefined as unknown as number,
        });
      }
    } else if (targetLength < currentLength) {
      // Remove excess periods from the end
      for (let i = currentLength - 1; i >= targetLength; i--) {
        remove(i);
      }
    }

    // Clear period validation errors when numberOfPeriods changes
    clearErrors("periods");
  }, [periodCount, fields.length, append, remove, clearErrors]);

  // Handle periods imported from file
  const handlePeriodsImported = useCallback(
    (
      periods: {
        date: string;
        startTime: string;
        endTime: string;
        mainLecturers: number;
        assistantLecturers: number;
      }[],
      numberOfPeriods: number
    ) => {
      // Update the number of periods
      setValue("numberOfPeriods", numberOfPeriods);
      // Replace all periods with imported data
      replace(periods);
    },
    [setValue, replace]
  );

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: CreateAdminTrainingFormData) => {
    // Prevent submission if there are table validation errors
    if (hasTableValidationErrors) {
      toast({
        title: t("common.error"),
        description: t("training.tableValidationError"),
        variant: "error",
      });
      return;
    }

    try {
      // Step 1: Create Training
      const trainingDto: AdminTrainingCreateDto = {
        name: data.trainingName,
        programId: Number(data.program),
        institutionId: Number(data.institution),
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate,
        note: data.notes || null,
        grade: data.grade || null,
        classInfo: data.class || null,
        numberStudents: data.numberOfStudents || null,
      };

      const createdTraining = await createTrainingMutation.mutateAsync(trainingDto, {
        onError: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : t("training.createTrainingError");
          toast({
            title: t("common.error"),
            description: errorMessage,
            variant: "error",
          });
        },
      });

      // Step 2: Create Periods in bulk (only if training creation succeeded)
      const periodsDto: PeriodBulkCreateDto = {
        trainingId: createdTraining.id,
        periods: data.periods.map((period) => ({
          date: period.date,
          startTime: period.startTime + ":00", // Append seconds for backend LocalTime format
          endTime: period.endTime + ":00",
          numberMainInstructors: period.mainLecturers || null,
          numberAssistantInstructors: period.assistantLecturers || null,
        })),
      };

      await createPeriodsBulkMutation.mutateAsync(periodsDto, {
        onError: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : t("training.createPeriodsError");
          toast({
            title: t("common.error"),
            description: errorMessage,
            variant: "error",
          });
        },
      });

      // Success: Show toast and navigate
      toast({
        title: t("common.success"),
        description: t("training.createTrainingSuccess"),
        variant: "success",
      });
      navigate(ROUTES.ADMIN_TRAINING_FULL);
    } catch (error) {
      // Error handling is done in the mutation onError callbacks
      console.error("Failed to create admin training:", error);
    }
  };

  // Log validation errors when form submission fails
  const onError = (formErrors: typeof errors) => {
    console.error("Form validation errors:", formErrors);
  };

  const isLoading = createTrainingMutation.isPending || createPeriodsBulkMutation.isPending;

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <PageLayout
        title={t("training.createTraining")}
        breadcrumbRoot="training"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_TRAINING_FULL)}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSubmitting || createTrainingMutation.isPending || createPeriodsBulkMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </>
        }
      >
        <div className="mt-6 flex flex-col items-center space-y-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit, onError)}
            className="w-full flex flex-col items-center space-y-6"
          >
            {/* Training Information Card */}
            <TrainingInfoSection
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              isSubmitting={isSubmitting}
            />

            {/* School Information Card */}
            <SchoolInfoSection
              control={control}
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
            />

            {/* Class Information Card */}
            <ClassInfoSection
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              isSubmitting={isSubmitting}
              fields={fields}
              onPeriodsImported={handlePeriodsImported}
              onValidationChange={setHasTableValidationErrors}
            />
          </form>
        </div>
      </PageLayout>
    </>
  );
};
