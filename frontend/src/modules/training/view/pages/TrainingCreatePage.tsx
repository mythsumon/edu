import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import { FormDatePickerField } from "../components/FormDatePickerField";
import { useProgramsQuery, useMasterCodeChildrenQuery, useInstitutionsQuery } from "../../controller/queries";
import { MASTER_CODE_PARENT_CODES, MASTER_CODE_PROGRAM_STATUS_ACTIVE } from "@/shared/constants/master-code";
import {
  createTrainingSchema,
  type CreateTrainingFormData,
} from "../../model/training.schema";

export const TrainingCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isTrainingInfoOpen, setIsTrainingInfoOpen] = useState(true);
  const [isSchoolInfoOpen, setIsSchoolInfoOpen] = useState(true);
  const [isClassInfoOpen, setIsClassInfoOpen] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTrainingFormData>({
    resolver: zodResolver(createTrainingSchema(t)),
    mode: "onChange",
    defaultValues: {
      trainingName: "",
      program: "",
      institution: "",
      description: "",
      startDate: "",
      endDate: "",
      notes: "",
    },
  });

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
    activeStatusId ? { page: 0, size: 1000, statusIds: [activeStatusId] } : { page: 0, size: 1000 }
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
  const { data: institutionsData } = useInstitutionsQuery({ page: 0, size: 1000 });
  const institutionOptions = useMemo(
    () =>
      institutionsData?.items?.map((institution) => ({
        value: String(institution.id),
        label: institution.name,
      })) || [],
    [institutionsData?.items]
  );

  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: CreateTrainingFormData) => {
    try {
      // TODO: Implement training creation
      console.log("Training form data:", data);
      navigate(ROUTES.ADMIN_TRAINING_FULL);
    } catch (error) {
      console.error("Failed to create training:", error);
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
            <Collapsible
              open={isTrainingInfoOpen}
              onOpenChange={setIsTrainingInfoOpen}
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
                        {isTrainingInfoOpen ? <ChevronUp /> : <ChevronDown />}
                        <span className="sr-only">
                          {isTrainingInfoOpen ? t("common.collapse") : t("common.expand")}
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
                        className={
                          errors.notes ? "ring-2 ring-destructive" : ""
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* School Information Card */}
            <Collapsible
              open={isSchoolInfoOpen}
              onOpenChange={setIsSchoolInfoOpen}
              className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
            >
              <Card>
                <div className="px-4">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="text-lg font-medium">
                      {t("training.schoolInformation")}
                    </h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        {isSchoolInfoOpen ? <ChevronUp /> : <ChevronDown />}
                        <span className="sr-only">
                          {isSchoolInfoOpen ? t("common.collapse") : t("common.expand")}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("training.schoolInformationDescription")}
                  </p>
                </div>
                <CollapsibleContent className="px-4">
                  <div className="py-4">
                    {/* TODO: Add school information form fields */}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Class Information Card */}
            <Collapsible
              open={isClassInfoOpen}
              onOpenChange={setIsClassInfoOpen}
              className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
            >
              <Card>
                <div className="px-4">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="text-lg font-medium">
                      {t("training.classInformation")}
                    </h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        {isClassInfoOpen ? <ChevronUp /> : <ChevronDown />}
                        <span className="sr-only">
                          {isClassInfoOpen ? t("common.collapse") : t("common.expand")}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("training.classInformationDescription")}
                  </p>
                </div>
                <CollapsibleContent className="px-4">
                  <div className="py-4">
                    {/* TODO: Add class information form fields */}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </form>
        </div>
      </PageLayout>
    </>
  );
};
