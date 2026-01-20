import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "react-i18next";
import { useRef, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrainingInfoSection } from "../components/TrainingInfoSection";
import { SchoolInfoSection } from "../components/SchoolInfoSection";
import { ClassInfoSection } from "../components/ClassInfoSection";
import {
  createAdminTrainingSchema,
  type CreateAdminTrainingFormData,
} from "../../model/admin-training.schema";

export const AdminTrainingCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    clearErrors,
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
      numberOfClasses: 1,
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: "periods",
  });

  // Watch number of classes to sync periods array
  const numberOfClassesValue = watch("numberOfClasses");
  const periodCount = useMemo(() => {
    if (!numberOfClassesValue || numberOfClassesValue < 1) return 0;
    return Math.min(numberOfClassesValue, 100); // Cap at 100 for safety
  }, [numberOfClassesValue]);

  // Sync periods array with numberOfClasses
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

    // Clear period validation errors when numberOfClasses changes
    clearErrors("periods");
  }, [periodCount, fields.length, append, remove, clearErrors]);

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: CreateAdminTrainingFormData) => {
    try {
      // TODO: Implement admin training creation
      console.log("Admin Training form data:", data);
      navigate(ROUTES.ADMIN_TRAINING_FULL);
    } catch (error) {
      console.error("Failed to create admin training:", error);
    }
  };

  return (
    <>
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
              disabled={isSubmitting}
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
            onSubmit={handleSubmit(onSubmit)}
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
            />
          </form>
        </div>
      </PageLayout>
    </>
  );
};
