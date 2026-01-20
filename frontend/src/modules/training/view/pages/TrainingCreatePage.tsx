import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import { FormDatePickerField } from "../components/FormDatePickerField";
import { FormTimePickerField } from "../components/FormTimePickerField";
import {
  useProgramsQuery,
  useMasterCodeChildrenQuery,
  useInstitutionsQuery,
} from "../../controller/queries";
import {
  MASTER_CODE_PARENT_CODES,
  MASTER_CODE_PROGRAM_STATUS_ACTIVE,
} from "@/shared/constants/master-code";
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
  const [activeClassTab, setActiveClassTab] = useState<"manual" | "excel">(
    "manual"
  );
  const [openPeriods, setOpenPeriods] = useState<Record<number, boolean>>({});

  const handleTabChange = useCallback((value: string) => {
    setActiveClassTab(value as "manual" | "excel");
  }, []);

  const togglePeriod = useCallback((periodIndex: number) => {
    setOpenPeriods((prev) => ({
      ...prev,
      [periodIndex]: !prev[periodIndex],
    }));
  }, []);

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

  // Watch start date to set min date for end date picker
  const startDateValue = watch("startDate");
  const startDateAsDate = useMemo(() => {
    if (!startDateValue || startDateValue.trim() === "") return undefined;
    const date = new Date(startDateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }, [startDateValue]);

  // Watch number of classes to generate period cards
  const numberOfClassesValue = watch("numberOfClasses");
  const periodCount = useMemo(() => {
    if (!numberOfClassesValue || numberOfClassesValue < 1) return 0;
    return Math.min(numberOfClassesValue, 100); // Cap at 100 for safety
  }, [numberOfClassesValue]);

  // Watch end date for period date constraints
  const endDateValue = watch("endDate");
  const endDateAsDate = useMemo(() => {
    if (!endDateValue || endDateValue.trim() === "") return undefined;
    const date = new Date(endDateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }, [endDateValue]);

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
  }, [periodCount, fields.length, append, remove]);

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = useCallback((n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }, []);

  // Expand/collapse all periods
  const areAllPeriodsExpanded = useMemo(() => {
    if (periodCount === 0) return false;
    return Array.from({ length: periodCount }, (_, i) => i).every(
      (index) => openPeriods[index] === true
    );
  }, [openPeriods, periodCount]);

  const toggleAllPeriods = useCallback(
    (count: number) => {
      const newState = !areAllPeriodsExpanded;
      const newOpenPeriods: Record<number, boolean> = {};
      for (let i = 0; i < count; i++) {
        newOpenPeriods[i] = newState;
      }
      setOpenPeriods(newOpenPeriods);
    },
    [areAllPeriodsExpanded]
  );

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
                          {isTrainingInfoOpen
                            ? t("common.collapse")
                            : t("common.expand")}
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
                          {isSchoolInfoOpen
                            ? t("common.collapse")
                            : t("common.expand")}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("training.schoolInformationDescription")}
                  </p>
                </div>
                <CollapsibleContent className="px-4">
                  {/* Grade, Class, Number of Students - Three columns on tablet+, one column on mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                    <FormField
                      id="grade"
                      label={t("training.gradeLabel")}
                      required
                      error={errors.grade}
                    >
                      <Input
                        id="grade"
                        type="text"
                        placeholder={t("training.gradePlaceholder")}
                        {...register("grade")}
                        className={
                          errors.grade ? "ring-2 ring-destructive" : ""
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>
                    <FormField
                      id="class"
                      label={t("training.classLabel")}
                      required
                      error={errors.class}
                    >
                      <Input
                        id="class"
                        type="text"
                        placeholder={t("training.classPlaceholder")}
                        {...register("class")}
                        className={
                          errors.class ? "ring-2 ring-destructive" : ""
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>
                    <FormField
                      id="numberOfStudents"
                      label={t("training.numberOfStudentsLabel")}
                      required
                      error={errors.numberOfStudents}
                    >
                      <Input
                        id="numberOfStudents"
                        type="number"
                        placeholder={t("training.numberOfStudentsPlaceholder")}
                        {...register("numberOfStudents", {
                          valueAsNumber: true,
                        })}
                        className={
                          errors.numberOfStudents
                            ? "ring-2 ring-destructive"
                            : ""
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>
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
                          {isClassInfoOpen
                            ? t("common.collapse")
                            : t("common.expand")}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("training.classInformationDescription")}
                  </p>
                </div>
                <CollapsibleContent className="px-4">
                  <div className="pb-4">
                    <Tabs
                      value={activeClassTab}
                      onValueChange={handleTabChange}
                      className="w-full p-1"
                    >
                      <TabsList className="relative grid w-full grid-cols-2 h-12 p-1 bg-muted/60 rounded-md">
                        {/* Sliding indicator */}
                        <div
                          className="absolute h-10 rounded-md bg-background shadow transition-all duration-300 ease-in-out bg-badge"
                          style={{
                            width: "calc(50% - 4px)",
                            left:
                              activeClassTab === "manual"
                                ? "4px"
                                : "calc(50% + 2px)",
                          }}
                        />
                        <TabsTrigger
                          value="manual"
                          className="font-medium relative z-10 h-10 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-300"
                        >
                          {t("training.manualTab")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="excel"
                          className="font-medium relative z-10 h-10 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors duration-300"
                        >
                          {t("training.excelTab")}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="manual"
                        className="animate-in fade-in-0 slide-in-from-left-2 duration-300"
                      >
                        <div className="pt-2 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              id="numberOfClasses"
                              label={t("training.numberOfClassesLabel")}
                              required
                              error={errors.numberOfClasses}
                            >
                              <Input
                                id="numberOfClasses"
                                type="number"
                                placeholder={t(
                                  "training.numberOfClassesPlaceholder"
                                )}
                                {...register("numberOfClasses", {
                                  valueAsNumber: true,
                                })}
                                className={
                                  errors.numberOfClasses
                                    ? "ring-2 ring-destructive"
                                    : ""
                                }
                                disabled={isSubmitting}
                              />
                            </FormField>
                          </div>

                          {/* Dynamic Period Cards */}
                          {periodCount > 0 && (
                            <div className="space-y-3 mt-4 bg-muted/60 border border-border/20 p-2 rounded-xl">
                              {/* Expand/Collapse All Button */}
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAllPeriods(periodCount)}
                                  className="text-xs hover:bg-muted/70"
                                >
                                  {areAllPeriodsExpanded ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      {t("common.collapseAll")}
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      {t("common.expandAll")}
                                    </>
                                  )}
                                </Button>
                              </div>
                              {fields.map((field, index) => (
                                <Collapsible
                                  key={field.id}
                                  open={openPeriods[index] ?? false}
                                  onOpenChange={() => togglePeriod(index)}
                                >
                                  <Card className="py-0 pb-2 overflow-hidden space-y-0 border border-border/30 bg-background rounded-lg shadow-none">
                                    <CollapsibleTrigger
                                      asChild
                                      className="mt-2"
                                    >
                                      <button
                                        type="button"
                                        className="w-full flex flex-row justify-between items-center py-2 px-4 transition-colors cursor-pointer"
                                      >
                                        <h3 className="text-sm font-normal">
                                          {t("training.periodTitle", {
                                            periodNumber: getOrdinalSuffix(
                                              index + 1
                                            ),
                                          })}
                                        </h3>
                                        {openPeriods[index] ? (
                                          <ChevronUp className="h-4 w-4 shrink-0" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4 shrink-0" />
                                        )}
                                      </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="border-t border-border/50 mt-0 pt-4 pb-2 px-4">
                                      <div className="space-y-4">
                                        {/* Date - Full width */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormDatePickerField
                                            id={`periods.${index}.date`}
                                            name={`periods.${index}.date`}
                                            label={t(
                                              "training.periodDateLabel"
                                            )}
                                            placeholder={t(
                                              "training.periodDatePlaceholder"
                                            )}
                                            control={control}
                                            error={
                                              errors.periods?.[index]?.date
                                            }
                                            required
                                            disabled={isSubmitting}
                                            minDate={startDateAsDate}
                                            maxDate={endDateAsDate}
                                          />
                                        </div>

                                        {/* Start Time and End Time - Two columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormTimePickerField
                                            id={`periods.${index}.startTime`}
                                            name={`periods.${index}.startTime`}
                                            label={t(
                                              "training.periodStartTimeLabel"
                                            )}
                                            placeholder={t(
                                              "training.periodStartTimePlaceholder"
                                            )}
                                            control={control}
                                            error={
                                              errors.periods?.[index]?.startTime
                                            }
                                            required
                                            disabled={isSubmitting}
                                          />
                                          <FormTimePickerField
                                            id={`periods.${index}.endTime`}
                                            name={`periods.${index}.endTime`}
                                            label={t(
                                              "training.periodEndTimeLabel"
                                            )}
                                            placeholder={t(
                                              "training.periodEndTimePlaceholder"
                                            )}
                                            control={control}
                                            error={
                                              errors.periods?.[index]?.endTime
                                            }
                                            required
                                            disabled={isSubmitting}
                                          />
                                        </div>

                                        {/* Main and Assistant Lecturers - Two columns */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormField
                                            id={`periods.${index}.mainLecturers`}
                                            label={t(
                                              "training.mainLecturersLabel"
                                            )}
                                            required
                                            error={
                                              errors.periods?.[index]
                                                ?.mainLecturers
                                            }
                                          >
                                            <Input
                                              id={`periods.${index}.mainLecturers`}
                                              type="number"
                                              placeholder={t(
                                                "training.mainLecturersPlaceholder"
                                              )}
                                              {...register(
                                                `periods.${index}.mainLecturers`,
                                                {
                                                  valueAsNumber: true,
                                                }
                                              )}
                                              className={
                                                errors.periods?.[index]
                                                  ?.mainLecturers
                                                  ? "ring-2 ring-destructive"
                                                  : ""
                                              }
                                              disabled={isSubmitting}
                                            />
                                          </FormField>
                                          <FormField
                                            id={`periods.${index}.assistantLecturers`}
                                            label={t(
                                              "training.assistantLecturersLabel"
                                            )}
                                            required
                                            error={
                                              errors.periods?.[index]
                                                ?.assistantLecturers
                                            }
                                          >
                                            <Input
                                              id={`periods.${index}.assistantLecturers`}
                                              type="number"
                                              placeholder={t(
                                                "training.assistantLecturersPlaceholder"
                                              )}
                                              {...register(
                                                `periods.${index}.assistantLecturers`,
                                                {
                                                  valueAsNumber: true,
                                                }
                                              )}
                                              className={
                                                errors.periods?.[index]
                                                  ?.assistantLecturers
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
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="excel"
                        className="animate-in fade-in-0 slide-in-from-right-2 duration-300"
                      >
                        <div className="pt-4 space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {t("training.excelTabDescription")}
                          </p>
                          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                            <p className="text-muted-foreground">
                              {t("training.excelTabPlaceholder")}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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
