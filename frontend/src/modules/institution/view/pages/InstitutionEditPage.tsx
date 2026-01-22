import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, Edit, ChevronUp, ChevronDown, Search } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { getInstitutionBasePath } from "../../lib/navigation";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import {
  updateInstitutionSchema,
  type UpdateInstitutionFormData,
} from "../../model/institution.schema";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import {
  useMasterCodeChildrenQuery,
  useMasterCodeGrandChildrenQuery,
  useMasterCodeByIdQuery,
  useInstitutionByIdQuery,
} from "../../controller/queries";
import { useUpdateInstitution } from "../../controller/mutations";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import { useTeachersListQuery } from "@/modules/teacher/controller/queries";
import type { InstitutionUpdateDto } from "../../model/institution.types";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import { openPostcodeSearch } from "@/shared/lib/postcode";

export const InstitutionEditPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const institutionId = id ? Number(id) : null;
  const updateInstitutionMutation = useUpdateInstitution();
  const [isOpen, setIsOpen] = useState(true);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(true);

  // Initialize edit mode from URL query parameter
  const modeFromUrl = searchParams.get("mode");
  const [isEditMode, setIsEditMode] = useState(modeFromUrl === "edit");

  // Fetch institution data
  const { data: institutionData, isLoading: isLoadingInstitution } =
    useInstitutionByIdQuery(institutionId, !!institutionId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInstitutionFormData>({
    resolver: zodResolver(updateInstitutionSchema(t)),
    mode: "onChange",
    disabled:
      updateInstitutionMutation.isPending ||
      isLoadingInstitution ||
      !isEditMode,
    defaultValues: {
      institutionName: "",
      phoneNumber: "",
      district: "",
      zone: "",
      region: "",
      streetRoad: "",
      detailAddress: "",
      majorCategory: "",
      category1: "",
      category2: "",
      institutionLevelClassification: "",
      contactName: "",
      contactPhoneNumber: "",
      contactEmail: "",
      notes: "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Fetch districts
  const { data: districts } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.DISTRICT
  );
  const districtList = useMemo(
    () => districts?.items || [],
    [districts?.items]
  );

  // Fetch regions based on selected district
  const districtCode = watch("district");
  const { data: regions } = useMasterCodeGrandChildrenQuery(districtCode);
  const regionList = useMemo(() => regions?.items || [], [regions?.items]);

  // Find selected region and fetch its parent (zone)
  const selectedRegionId = watch("region");
  const selectedRegion = useMemo(() => {
    if (!selectedRegionId || regionList.length === 0) return null;
    return (
      regionList.find((region) => String(region.id) === selectedRegionId) ||
      null
    );
  }, [selectedRegionId, regionList]);

  const { data: zone } = useMasterCodeByIdQuery(
    selectedRegion?.parentId ?? null,
    !!selectedRegion?.parentId
  );

  // Set zone value when zone data is available
  useEffect(() => {
    if (zone?.id) {
      setValue("zone", String(zone.id));
    }
  }, [zone?.id, setValue]);

  // Display values for readonly fields
  const districtDisplayValue = useMemo(() => {
    if (!districtCode || districtList.length === 0) return "";
    const district = districtList.find((d) => d.code === districtCode);
    return district?.codeName || "";
  }, [districtCode, districtList]);

  const zoneDisplayValue = zone?.codeName || "";

  // Fetch categories from API
  const { data: majorCategories } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.MAJOR_CATEGORY
  );
  const majorCategoryList = useMemo(
    () => majorCategories?.items || [],
    [majorCategories?.items]
  );

  const { data: category1Data } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.CATEGORY1
  );
  const category1List = useMemo(
    () => category1Data?.items || [],
    [category1Data?.items]
  );

  const { data: category2Data } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.CATEGORY2
  );
  const category2List = useMemo(
    () => category2Data?.items || [],
    [category2Data?.items]
  );

  const { data: institutionLevelData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.INSTITUTION_LEVEL_CLASSIFICATION
  );
  const institutionLevelList = useMemo(
    () => institutionLevelData?.items || [],
    [institutionLevelData?.items]
  );

  // Fetch teachers for contact name dropdown
  const { data: teachersData } = useTeachersListQuery({ page: 0, size: 1000 });
  const teacherList = useMemo(
    () => teachersData?.items || [],
    [teachersData?.items]
  );

  // Transform API data to options format
  const regionOptions = useMemo(
    () =>
      regionList.map((region) => ({
        value: String(region.id),
        label: region.codeName,
      })),
    [regionList]
  );

  const majorCategoryOptions = useMemo(
    () =>
      majorCategoryList.map((category) => ({
        value: String(category.id),
        label: category.codeName,
      })),
    [majorCategoryList]
  );

  const category1Options = useMemo(
    () =>
      category1List.map((category) => ({
        value: String(category.id),
        label: category.codeName,
      })),
    [category1List]
  );

  const category2Options = useMemo(
    () =>
      category2List.map((category) => ({
        value: String(category.id),
        label: category.codeName,
      })),
    [category2List]
  );

  const institutionLevelOptions = useMemo(
    () =>
      institutionLevelList.map((level) => ({
        value: String(level.id),
        label: level.codeName,
      })),
    [institutionLevelList]
  );

  const teacherOptions = useMemo(
    () =>
      teacherList.map((teacher) => ({
        value: String(teacher.userId),
        label: teacher.name,
      })),
    [teacherList]
  );

  // Watch selected teacher and populate contact fields
  const selectedTeacherId = watch("contactName");
  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherId || teacherList.length === 0) return null;
    return (
      teacherList.find(
        (teacher) => String(teacher.userId) === selectedTeacherId
      ) || null
    );
  }, [selectedTeacherId, teacherList]);

  // Auto-populate contact phone and email when teacher is selected
  useEffect(() => {
    if (selectedTeacher) {
      setValue("contactPhoneNumber", selectedTeacher.phone || "");
      setValue("contactEmail", selectedTeacher.email || "");
    }
  }, [selectedTeacher, setValue]);

  // Pre-fill form when institution data is loaded
  useEffect(() => {
    if (institutionData && districtList.length > 0) {
      // Find district by ID from institution data
      const district = districtList.find(
        (d) => d.id === institutionData.district?.id
      );

      reset({
        institutionName: institutionData.name || "",
        phoneNumber: institutionData.phoneNumber || "",
        district: district?.code || "",
        zone: institutionData.zone ? String(institutionData.zone.id) : "",
        region: institutionData.region ? String(institutionData.region.id) : "",
        streetRoad: institutionData.street || "",
        detailAddress: institutionData.address || "",
        majorCategory: institutionData.majorCategory
          ? String(institutionData.majorCategory.id)
          : "",
        category1: institutionData.categoryOne
          ? String(institutionData.categoryOne.id)
          : "",
        category2: institutionData.categoryTwo
          ? String(institutionData.categoryTwo.id)
          : "",
        institutionLevelClassification: institutionData.classification
          ? String(institutionData.classification.id)
          : "",
        contactName: institutionData.teacher
          ? String(institutionData.teacher.userId)
          : "",
        contactPhoneNumber: institutionData.teacher?.phone || "",
        contactEmail: institutionData.teacher?.email || "",
        notes: institutionData.notes || "",
      });
    }
  }, [institutionData, districtList, reset]);

  const handleSearchAddress = () => {
    openPostcodeSearch({
      onComplete: (data) => {
        // Use roadAddress if available, otherwise use address
        const address = data.roadAddress || data.address;
        setValue("streetRoad", address, { shouldValidate: true });
      },
      onClose: (state) => {
        if (state === "FORCE_CLOSE") {
          // User closed the popup without selecting
        }
      },
    });
  };

  const onSubmit = async (data: UpdateInstitutionFormData) => {
    if (!institutionId) return;

    try {
      // Find district ID from district code
      const district = districtList.find((d) => d.code === data.district);

      // Map form data to API DTO format
      const updateDto: InstitutionUpdateDto = {
        name: data.institutionName,
        phoneNumber: data.phoneNumber,
        districtId: district?.id ? Number(district.id) : null,
        zoneId: zone?.id ? Number(zone.id) : null,
        regionId: data.region ? Number(data.region) : null,
        street: data.streetRoad,
        address: data.detailAddress,
        majorCategoryId: data.majorCategory ? Number(data.majorCategory) : null,
        categoryOneId: data.category1 ? Number(data.category1) : null,
        categoryTwoId: data.category2 ? Number(data.category2) : null,
        classificationId: data.institutionLevelClassification
          ? Number(data.institutionLevelClassification)
          : null,
        notes: data.notes || null,
        teacherId: data.contactName ? Number(data.contactName) : null,
      };

      await updateInstitutionMutation.mutateAsync({
        id: institutionId,
        data: updateDto,
      });
      // Switch back to detail view after successful update
      setIsEditMode(false);
    } catch (error) {
      // Error handling is done by the mutation
      // Stay on current page on error
      console.error("Failed to update institution:", error);
    }
  };

  if (isLoadingInstitution) {
    return (
      <PageLayout
        title={t("institution.editInstitution")}
        customBreadcrumbRoot={{
          path: getInstitutionBasePath(),
          label: t("sidebar.institution"),
        }}
      >
        <LoadingOverlay isLoading={true} />
      </PageLayout>
    );
  }

  if (!institutionData && !isLoadingInstitution) {
    return (
      <PageLayout
        title={t("institution.editInstitution")}
        customBreadcrumbRoot={{
          path: getInstitutionBasePath(),
          label: t("sidebar.institution"),
        }}
      >
        <div className="mt-6 flex flex-col items-center">
          <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px] p-6">
            <p className="text-center text-muted-foreground">
              {t("institution.institutionNotFound")}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(getInstitutionBasePath())}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("institution.backToList")}
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={updateInstitutionMutation.isPending} />
      <PageLayout
        title={
          isEditMode
            ? t("institution.editInstitution")
            : t("institution.institutionDetails")
        }
        customBreadcrumbRoot={{
          path: getInstitutionBasePath(),
          label: t("sidebar.institution"),
        }}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (isEditMode) {
                  // Reset form to original data when canceling edit
                  if (institutionData && districtList.length > 0) {
                    const district = districtList.find(
                      (d) => d.id === institutionData.district?.id
                    );
                    reset({
                      institutionName: institutionData.name || "",
                      phoneNumber: institutionData.phoneNumber || "",
                      district: district?.code || "",
                      zone: institutionData.zone
                        ? String(institutionData.zone.id)
                        : "",
                      region: institutionData.region
                        ? String(institutionData.region.id)
                        : "",
                      streetRoad: institutionData.street || "",
                      detailAddress: institutionData.address || "",
                      majorCategory: institutionData.majorCategory
                        ? String(institutionData.majorCategory.id)
                        : "",
                      category1: institutionData.categoryOne
                        ? String(institutionData.categoryOne.id)
                        : "",
                      category2: institutionData.categoryTwo
                        ? String(institutionData.categoryTwo.id)
                        : "",
                      institutionLevelClassification:
                        institutionData.classification
                          ? String(institutionData.classification.id)
                          : "",
                      contactName: institutionData.teacher
                        ? String(institutionData.teacher.userId)
                        : "",
                      contactPhoneNumber: institutionData.teacher?.phone || "",
                      contactEmail: institutionData.teacher?.email || "",
                      notes: institutionData.notes || "",
                    });
                  }
                  setIsEditMode(false);
                } else {
                  navigate(getInstitutionBasePath());
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
                disabled={isSubmitting || updateInstitutionMutation.isPending}
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
              {/* Institution Information */}
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
              >
                <Card>
                  <div className="px-4">
                    <div className="flex flex-row justify-between items-start">
                      <h2 className="text-lg font-medium">
                        {t("institution.institutionInformation")}
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
                      {t("institution.institutionInformationDescription")}
                    </p>
                  </div>
                  <CollapsibleContent className="px-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        id="institutionName"
                        label={t("institution.institutionNameLabel")}
                        required
                        error={errors.institutionName}
                      >
                        <Input
                          id="institutionName"
                          type="text"
                          placeholder={t(
                            "institution.institutionNamePlaceholder"
                          )}
                          {...register("institutionName")}
                          className={
                            errors.institutionName
                              ? "ring-2 ring-destructive"
                              : ""
                          }
                          readOnly={!isEditMode}
                          disabled={
                            !isEditMode ||
                            isSubmitting ||
                            updateInstitutionMutation.isPending
                          }
                        />
                      </FormField>
                      <FormField
                        id="phoneNumber"
                        label={t("institution.phoneNumberLabel")}
                        required
                        error={errors.phoneNumber}
                      >
                        <Input
                          id="phoneNumber"
                          type="number"
                          placeholder={t("institution.phoneNumberPlaceholder")}
                          {...register("phoneNumber")}
                          className={
                            errors.phoneNumber ? "ring-2 ring-destructive" : ""
                          }
                          readOnly={!isEditMode}
                          disabled={
                            !isEditMode ||
                            isSubmitting ||
                            updateInstitutionMutation.isPending
                          }
                        />
                      </FormField>
                    </div>

                    {/* Location Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="col-span-1">
                        <FormField
                          id="district"
                          label={t("institution.districtLabel")}
                          required
                        >
                          <Controller
                            name="district"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="district"
                                type="text"
                                placeholder={t(
                                  "institution.districtPlaceholder"
                                )}
                                value={districtDisplayValue}
                                onChange={field.onChange}
                                readOnly
                                disabled
                              />
                            )}
                          />
                        </FormField>
                      </div>
                      <FormField
                        id="zone"
                        label={t("institution.zoneLabel")}
                        required
                      >
                        <Controller
                          name="zone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="zone"
                              type="text"
                              placeholder={t("institution.zonePlaceholder")}
                              value={zoneDisplayValue}
                              onChange={field.onChange}
                              readOnly
                              disabled
                            />
                          )}
                        />
                      </FormField>
                      <FormDropdownField
                        id="region"
                        name="region"
                        label={t("institution.regionLabel")}
                        placeholder={t("institution.regionPlaceholder")}
                        control={control}
                        options={regionOptions}
                        error={errors.region}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                    </div>

                    {/* Address Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        id="streetRoad"
                        label={t("institution.streetRoadLabel")}
                        required
                        error={errors.streetRoad}
                      >
                        <div className="flex gap-2">
                          <Input
                            id="streetRoad"
                            type="text"
                            placeholder={t("institution.streetRoadPlaceholder")}
                            {...register("streetRoad")}
                            className={
                              errors.streetRoad ? "ring-2 ring-destructive" : ""
                            }
                            readOnly={!isEditMode}
                            disabled={
                              !isEditMode ||
                              isSubmitting ||
                              updateInstitutionMutation.isPending
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSearchAddress}
                            disabled={
                              !isEditMode ||
                              isSubmitting ||
                              updateInstitutionMutation.isPending
                            }
                            className="shrink-0 whitespace-nowrap"
                          >
                            <Search className="h-4 w-4" />
                            <span>{t("accountManagement.searchAddressButton")}</span>
                          </Button>
                        </div>
                      </FormField>
                      <FormField
                        id="detailAddress"
                        label={t("institution.detailAddressLabel")}
                        required
                        error={errors.detailAddress}
                      >
                        <Input
                          id="detailAddress"
                          type="text"
                          placeholder={t(
                            "institution.detailAddressPlaceholder"
                          )}
                          {...register("detailAddress")}
                          className={
                            errors.detailAddress
                              ? "ring-2 ring-destructive"
                              : ""
                          }
                          readOnly={!isEditMode}
                          disabled={
                            !isEditMode ||
                            isSubmitting ||
                            updateInstitutionMutation.isPending
                          }
                        />
                      </FormField>
                    </div>

                    {/* Category Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormDropdownField
                        id="majorCategory"
                        name="majorCategory"
                        label={t("institution.majorCategoryLabel")}
                        placeholder={t("institution.majorCategoryPlaceholder")}
                        control={control}
                        options={majorCategoryOptions}
                        error={errors.majorCategory}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                      <FormDropdownField
                        id="category1"
                        name="category1"
                        label={t("institution.category1Label")}
                        placeholder={t("institution.category1Placeholder")}
                        control={control}
                        options={category1Options}
                        error={errors.category1}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormDropdownField
                        id="category2"
                        name="category2"
                        label={t("institution.category2Label")}
                        placeholder={t("institution.category2Placeholder")}
                        control={control}
                        options={category2Options}
                        error={errors.category2}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                      <FormDropdownField
                        id="institutionLevelClassification"
                        name="institutionLevelClassification"
                        label={t(
                          "institution.institutionLevelClassificationLabel"
                        )}
                        placeholder={t(
                          "institution.institutionLevelClassificationPlaceholder"
                        )}
                        control={control}
                        options={institutionLevelOptions}
                        error={errors.institutionLevelClassification}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                    </div>

                    {/* Notes */}
                    <div className="mt-4 py-1">
                      <FormField
                        id="notes"
                        label={t("institution.notes")}
                        error={errors.notes}
                      >
                        <Textarea
                          id="notes"
                          placeholder={t("institution.notesPlaceholder")}
                          {...register("notes")}
                          className={
                            errors.notes ? "ring-2 ring-destructive" : ""
                          }
                          readOnly={!isEditMode}
                          disabled={
                            !isEditMode ||
                            isSubmitting ||
                            updateInstitutionMutation.isPending
                          }
                        />
                      </FormField>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Contact Information Card */}
              <Collapsible
                open={isContactInfoOpen}
                onOpenChange={setIsContactInfoOpen}
                className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
              >
                <Card>
                  <div className="px-4">
                    <div className="flex flex-row justify-between items-start">
                      <h2 className="text-lg font-medium">
                        {t("institution.contactInformation")}
                      </h2>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          {isContactInfoOpen ? <ChevronUp /> : <ChevronDown />}
                          <span className="sr-only">
                            {isContactInfoOpen
                              ? t("common.collapse")
                              : t("common.expand")}
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("institution.contactInformationDescription")}
                    </p>
                  </div>
                  <CollapsibleContent className="px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                      <FormDropdownField
                        id="contactName"
                        name="contactName"
                        label={t("institution.contactNameLabel")}
                        placeholder={t("institution.contactNamePlaceholder")}
                        control={control}
                        options={teacherOptions}
                        error={errors.contactName}
                        required
                        disabled={
                          !isEditMode ||
                          isSubmitting ||
                          updateInstitutionMutation.isPending
                        }
                      />
                      <FormField
                        id="contactPhoneNumber"
                        label={t("institution.contactPhoneNumberLabel")}
                        required
                      >
                        <Input
                          id="contactPhoneNumber"
                          type="text"
                          placeholder={t(
                            "institution.contactPhoneNumberPlaceholder"
                          )}
                          {...register("contactPhoneNumber")}
                          readOnly
                        />
                      </FormField>
                      <FormField
                        id="contactEmail"
                        label={t("institution.contactEmailLabel")}
                        required
                      >
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder={t("institution.contactEmailPlaceholder")}
                          {...register("contactEmail")}
                          readOnly
                        />
                      </FormField>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </form>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* First Card: Institution Overview */}
              <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]">
                <div className="flex flex-col space-y-1 px-4">
                  {/* Tags */}
                  <div className="flex flex-row gap-2">
                    <span className="px-4 py-1 rounded-full bg-muted text-secondary-foreground text-sm md:text-xs font-normal">
                      {institutionData?.institutionId || "-"}
                    </span>
                    {institutionData?.zone?.codeName && (
                      <span className="px-3 py-1 rounded-full bg-badge text-badge text-sm md:text-xs font-normal">
                        {institutionData.zone.codeName}
                      </span>
                    )}
                  </div>

                  {/* Institution Name */}
                  <h3 className="text-lg font-semibold text-blue-600 text-left">
                    {institutionData?.name || "-"}
                  </h3>

                  {/* Details */}
                  <div className="flex flex-row items-center justify-start gap-2 text-sm text-gray-600 flex-wrap">
                    <span className="text-secondary-foreground">
                      <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                        {t("institution.detailView.phoneNumber")}
                      </span>{" "}
                      {institutionData?.phoneNumber || "-"}
                    </span>
                    {institutionData?.teacher?.name && (
                      <>
                        <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                          |
                        </span>
                        <span>
                          <span className="text-sm md:text-xs font-normal text-secondary-foreground/40">
                            {t("institution.detailView.manager")}
                          </span>{" "}
                          {institutionData.teacher.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Second Card: Educational Institution Information */}
              <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]">
                <div className="px-4">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="text-lg font-medium">
                      {t("institution.institutionInformation")}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("institution.institutionInformationViewDescription")}
                  </p>
                </div>
                <div className="px-4">
                  {/* Row-based Layout */}
                  <div className="flex flex-col space-y-4">
                    {/* Row 1: InstitutionID and InstitutionName */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.institutionId")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.institutionId || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.institutionName")}
                        </span>
                        <span className="text-sm font-normal text-blue-600">
                          {institutionData?.name || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: phoneNumber and district */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.phoneNumber")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.phoneNumber || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.districtLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.district?.codeName || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: zone and region */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.zoneLabel")}
                        </span>
                        {institutionData?.zone?.codeName ? (
                          <span className="px-3 py-1 rounded-full bg-badge text-badge text-sm md:text-xs font-normal self-start">
                            {institutionData.zone.codeName}
                          </span>
                        ) : (
                          <span className="text-sm font-normal">-</span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.regionLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.region?.codeName || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 4: street/road and detail address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.streetRoadLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.street || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.detailedAddress")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.address || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 5: major category and classification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.majorCategories")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.majorCategory?.codeName || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t(
                            "institution.detailView.schoolLevelClassification"
                          )}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.classification?.codeName || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Row 6: Category 1 and Category 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.detailView.category1")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.categoryOne?.codeName || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.category2Label")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.categoryTwo?.codeName || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes - Full width */}
                  <div className="flex flex-col space-y-1 mt-4">
                    <span className="text-xs text-gray-500">
                      {t("institution.detailView.notes")}
                    </span>
                    <span className="text-sm font-normal whitespace-pre-wrap">
                      {institutionData?.notes || "-"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Third Card: Contact Information */}
              <Card className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]">
                <div className="px-4">
                  <div className="flex flex-row justify-between items-start">
                    <h2 className="text-lg font-medium">
                      {t("institution.contactInformation")}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("institution.contactInformationViewDescription")}
                  </p>
                </div>
                <div className="px-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.contactNameLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.teacher?.name || "-"}
                        </span>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.contactPhoneNumberLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.teacher?.phone || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">
                          {t("institution.contactEmailLabel")}
                        </span>
                        <span className="text-sm font-normal">
                          {institutionData?.teacher?.email ||
                            t("institution.unregistered")}
                        </span>
                      </div>
                    </div>
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
