import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { getProgramBasePath } from "../../lib/navigation";
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
  createProgramSchema,
  type CreateProgramFormData,
} from "../../model/program.schema";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import { useMasterCodeChildrenQuery } from "../../controller/queries";
import { useCreateProgram } from "../../controller/mutations";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import type { ProgramCreateDto } from "../../model/program.types";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";

export const ProgramCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createProgramMutation = useCreateProgram();
  const [isOpen, setIsOpen] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema(t)),
    mode: "onChange",
    disabled: createProgramMutation.isPending,
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

  // Watch selected values for dynamic label
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

  // Auto-update programName when selections change
  useEffect(() => {
    setValue("programName", generatedProgramName, { shouldValidate: true });
  }, [generatedProgramName, setValue]);

  const onSubmit = async (data: CreateProgramFormData) => {
    try {
      // Map form data to API DTO format
      const createDto: ProgramCreateDto = {
        name: data.programName,
        sessionPartId: Number(data.sessionPart),
        statusId: Number(data.status),
        programTypeId: data.programType ? Number(data.programType) : null,
        notes: data.notes || null,
      };

      await createProgramMutation.mutateAsync(createDto);
      // Navigate to program list page on success (role-aware)
      navigate(getProgramBasePath());
    } catch (error) {
      // Error handling is done by the mutation
      // Stay on current page on error
      console.error("Failed to create program:", error);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={createProgramMutation.isPending} />
      <PageLayout
        title={t("program.createTitle")}
        breadcrumbRoot="program"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(getProgramBasePath())}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSubmitting || createProgramMutation.isPending}
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
                      disabled={isSubmitting || createProgramMutation.isPending}
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
                      disabled={isSubmitting || createProgramMutation.isPending}
                    />
                  </div>

                  {/* Row 2: Program Name (with dynamic suffix) and Status */}
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
                      disabled={isSubmitting || createProgramMutation.isPending}
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
                        disabled={
                          isSubmitting || createProgramMutation.isPending
                        }
                      />
                    </FormField>
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
