import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import {
  updateProgramSchema,
  type UpdateProgramFormData,
} from "../../model/program.schema";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import { useMasterCodeChildrenQuery, useProgramByIdQuery } from "../../controller/queries";
import { useUpdateProgram } from "../../controller/mutations";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import type { ProgramUpdateDto } from "../../model/program.types";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";

export const ProgramEditPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const programId = id ? Number(id) : null;
  const updateProgramMutation = useUpdateProgram();
  const [isOpen, setIsOpen] = useState(true);

  // Initialize edit mode from URL query parameter
  const modeFromUrl = searchParams.get("mode");
  const [isEditMode, setIsEditMode] = useState(modeFromUrl === "edit");

  // Fetch program data
  const { data: programData, isLoading: isLoadingProgram } =
    useProgramByIdQuery(programId, !!programId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProgramFormData>({
    resolver: zodResolver(updateProgramSchema(t)),
    mode: "onChange",
    disabled:
      updateProgramMutation.isPending ||
      isLoadingProgram ||
      !isEditMode,
    defaultValues: {
      programName: "",
      sessionPart: "",
      status: "",
      programType: "",
      notes: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Fetch session parts from master code 1000
  const { data: sessionPartsData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.SESSION_PART
  );
  const sessionPartList = useMemo(
    () => sessionPartsData?.items || [],
    [sessionPartsData?.items]
  );

  // Fetch status from master code 1100
  const { data: statusData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.PROGRAM_STATUS
  );
  const statusList = useMemo(
    () => statusData?.items || [],
    [statusData?.items]
  );

  // Fetch program types from master code 1200
  const { data: programTypeData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.PROGRAM_TYPE
  );
  const programTypeList = useMemo(
    () => programTypeData?.items || [],
    [programTypeData?.items]
  );

  // Transform API data to options format
  const sessionPartOptions = useMemo(
    () =>
      sessionPartList.map((sessionPart) => ({
        value: String(sessionPart.id),
        label: sessionPart.codeName,
      })),
    [sessionPartList]
  );

  const statusOptions = useMemo(
    () =>
      statusList.map((status) => ({
        value: String(status.id),
        label: status.codeName,
      })),
    [statusList]
  );

  const programTypeOptions = useMemo(
    () =>
      programTypeList.map((programType) => ({
        value: String(programType.id),
        label: programType.codeName,
      })),
    [programTypeList]
  );

  // Watch selected values for dynamic program name
  const selectedSessionPart = useWatch({ control, name: "sessionPart" });
  const selectedProgramType = useWatch({ control, name: "programType" });

  // Get selected labels for display
  const selectedSessionPartLabel = useMemo(() => {
    const option = sessionPartOptions.find((o) => o.value === selectedSessionPart);
    return option?.label || "";
  }, [sessionPartOptions, selectedSessionPart]);

  const selectedProgramTypeLabel = useMemo(() => {
    const option = programTypeOptions.find((o) => o.value === selectedProgramType);
    return option?.label || "";
  }, [programTypeOptions, selectedProgramType]);

  // Build dynamic program name from selected values
  const generatedProgramName = useMemo(() => {
    const parts = [selectedSessionPartLabel, selectedProgramTypeLabel].filter(Boolean);
    return parts.join(" ");
  }, [selectedSessionPartLabel, selectedProgramTypeLabel]);

  // Auto-update programName when selections change (only in edit mode)
  useEffect(() => {
    if (isEditMode && generatedProgramName) {
      setValue("programName", generatedProgramName, { shouldValidate: true });
    }
  }, [generatedProgramName, setValue, isEditMode]);

  // Pre-fill form when program data is loaded
  useEffect(() => {
    if (programData) {
      reset({
        programName: programData.name || "",
        sessionPart: programData.sessionPart ? String(programData.sessionPart.id) : "",
        status: programData.status ? String(programData.status.id) : "",
        programType: programData.programType ? String(programData.programType.id) : "",
        notes: programData.notes || "",
      });
    }
  }, [programData, reset]);

  const onSubmit = async (data: UpdateProgramFormData) => {
    if (!programId) return;

    try {
      // Map form data to API DTO format
      const updateDto: ProgramUpdateDto = {
        name: data.programName,
        sessionPartId: Number(data.sessionPart),
        statusId: Number(data.status),
        programTypeId: data.programType ? Number(data.programType) : null,
        notes: data.notes || null,
      };

      await updateProgramMutation.mutateAsync({
        id: programId,
        data: updateDto,
      });
      // Switch back to detail view after successful update
      setIsEditMode(false);
    } catch (error) {
      // Error handling is done by the mutation
      // Stay on current page on error
      console.error("Failed to update program:", error);
    }
  };

  if (isLoadingProgram) {
    return (
      <PageLayout
        title={t("program.editProgram")}
        customBreadcrumbRoot={{
          path: ROUTES.ADMIN_PROGRAM_FULL,
          label: t("sidebar.program"),
        }}
      >
        <LoadingOverlay isLoading={true} />
      </PageLayout>
    );
  }

  if (!programData && !isLoadingProgram) {
    return (
      <PageLayout
        title={t("program.editProgram")}
        customBreadcrumbRoot={{
          path: ROUTES.ADMIN_PROGRAM_FULL,
          label: t("sidebar.program"),
        }}
      >
        <div className="mt-6 flex flex-col items-center">
          <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px] p-6">
            <p className="text-center text-muted-foreground">
              {t("program.programNotFound")}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_PROGRAM_FULL)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("program.backToList")}
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={updateProgramMutation.isPending} />
      <PageLayout
        title={
          isEditMode
            ? t("program.editProgram")
            : t("program.programDetails")
        }
        customBreadcrumbRoot={{
          path: ROUTES.ADMIN_PROGRAM_FULL,
          label: t("sidebar.program"),
        }}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (isEditMode) {
                  // Reset form to original data when canceling edit
                  if (programData) {
                    reset({
                      programName: programData.name || "",
                      sessionPart: programData.sessionPart
                        ? String(programData.sessionPart.id)
                        : "",
                      status: programData.status
                        ? String(programData.status.id)
                        : "",
                      programType: programData.programType
                        ? String(programData.programType.id)
                        : "",
                      notes: programData.notes || "",
                    });
                  }
                  setIsEditMode(false);
                } else {
                  navigate(ROUTES.ADMIN_PROGRAM_FULL);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              {isEditMode ? t("common.cancel") : t("common.back")}
            </Button>
            {isEditMode ? (
              <Button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={isSubmitting || updateProgramMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
            ) : (
              <Button type="button" onClick={() => setIsEditMode(true)}>
                <Edit className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            )}
          </>
        }
      >
        <div className="mt-6 flex flex-col items-center space-y-6">
          {isEditMode ? (
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col items-center space-y-6"
            >
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
              >
                <Card>
                  <div className="px-4">
                    <div className="flex flex-row justify-between items-start">
                      <h2 className="text-lg font-medium">
                        {t("program.programInformation")}
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
                      {t("program.programInformationDescription")}
                    </p>
                  </div>
                  <CollapsibleContent className="px-4">
                    {/* Row 1: Session/Part and Program Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormDropdownField
                        id="sessionPart"
                        name="sessionPart"
                        label={t("program.sessionPartLabel")}
                        placeholder={t("program.sessionPartPlaceholder")}
                        control={control}
                        options={sessionPartOptions}
                        error={errors.sessionPart}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateProgramMutation.isPending
                        }
                      />
                      <FormDropdownField
                        id="programType"
                        name="programType"
                        label={t("program.programTypeLabel")}
                        placeholder={t("program.programTypePlaceholder")}
                        control={control}
                        options={programTypeOptions}
                        error={errors.programType}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateProgramMutation.isPending
                        }
                      />
                    </div>

                    {/* Row 2: Program Name and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        id="programName"
                        label={t("program.programNameLabel")}
                        required
                      >
                        <Input
                          id="programName"
                          type="text"
                          placeholder={t("program.programNamePlaceholder")}
                          value={generatedProgramName}
                          readOnly
                          disabled
                          className="bg-muted"
                        />
                      </FormField>
                      <FormDropdownField
                        id="status"
                        name="status"
                        label={t("program.statusLabel")}
                        placeholder={t("program.statusPlaceholder")}
                        control={control}
                        options={statusOptions}
                        error={errors.status}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateProgramMutation.isPending
                        }
                      />
                    </div>

                    {/* Notes */}
                    <div className="mt-4 py-1">
                      <FormField
                        id="notes"
                        label={t("program.notesLabel")}
                        error={errors.notes}
                      >
                        <Textarea
                          id="notes"
                          placeholder={t("program.notesPlaceholder")}
                          {...register("notes")}
                          className={
                            errors.notes ? "ring-2 ring-destructive" : ""
                          }
                          readOnly={!isEditMode}
                          disabled={
                            !isEditMode ||
                            isSubmitting ||
                            updateProgramMutation.isPending
                          }
                        />
                      </FormField>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* Program Overview Card */}
              <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]">
                <div className="flex flex-col space-y-1 px-4">
                  {/* Tags */}
                  <div className="flex flex-row gap-2">
                    <span className="px-4 py-1 rounded-full bg-muted text-secondary-foreground text-sm md:text-xs font-normal">
                      {programData?.programId || "-"}
                    </span>
                    {programData?.status?.codeName && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm md:text-xs font-medium ${
                          programData.status.codeName.toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : programData.status.codeName.toLowerCase() === "pending"
                            ? "bg-orange-100 text-yellow-700"
                            : programData.status.codeName.toLowerCase() === "inactive"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {programData.status.codeName}
                      </span>
                    )}
                  </div>

                  {/* Program Name */}
                  <h3 className="text-lg font-semibold text-blue-600 text-left">
                    {programData?.name || "-"}
                  </h3>

                  {/* Details */}
                  <div className="flex flex-row items-center justify-start gap-2 text-sm text-gray-600 flex-wrap">
                    {programData?.sessionPart?.codeName && (
                      <span className="text-secondary-foreground">
                        <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                          {t("program.sessionPart")}
                        </span>{" "}
                        {programData.sessionPart.codeName}
                      </span>
                    )}
                    {programData?.programType?.codeName && (
                      <>
                        <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                          |
                        </span>
                        <span>
                          <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                            {t("program.programType")}
                          </span>{" "}
                          {programData.programType.codeName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Program Information Card */}
              <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]">
                <div className="px-4">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="text-lg font-medium">
                      {t("program.programInformation")}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("program.programInformationViewDescription")}
                  </p>
                </div>
                <div className="px-4">
                  {/* Row-based Layout */}
                  <div className="flex flex-col space-y-4">
                    {/* Row 1: Program ID and Program Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("program.programId")}
                        </span>
                        <span className="text-sm font-normal">
                          {programData?.programId || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("program.programName")}
                        </span>
                        <span className="text-sm font-normal text-blue-600">
                          {programData?.name || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Session/Part and Program Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("program.sessionPart")}
                        </span>
                        <span className="text-sm font-normal">
                          {programData?.sessionPart?.codeName || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("program.programType")}
                        </span>
                        <span className="text-sm font-normal">
                          {programData?.programType?.codeName || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("program.status")}
                        </span>
                        {programData?.status?.codeName ? (
                          <span
                            className={`px-3 py-1 rounded-full text-sm md:text-xs font-medium self-start ${
                              programData.status.codeName.toLowerCase() === "active"
                                ? "bg-green-100 text-green-700"
                                : programData.status.codeName.toLowerCase() === "pending"
                                ? "bg-orange-100 text-yellow-700"
                                : programData.status.codeName.toLowerCase() === "inactive"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {programData.status.codeName}
                          </span>
                        ) : (
                          <span className="text-sm font-normal">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes - Full width */}
                  <div className="flex flex-col space-y-1 mt-4">
                    <span className="text-xs text-gray-500">
                      {t("program.notes")}
                    </span>
                    <span className="text-sm font-normal whitespace-pre-wrap">
                      {programData?.notes || "-"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};
