import { PageLayout } from "@/app/layout/PageLayout";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ArrowLeft, Save, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
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
  createInstitutionSchema,
  type CreateInstitutionFormData,
} from "../../model/institution.schema";
import { FormField } from "../components/FormField";
import { FormDropdownField } from "../components/FormDropdownField";
import {
  useMasterCodeChildrenQuery,
  useMasterCodeGrandChildrenQuery,
  useMasterCodeByIdQuery,
} from "../../controller/queries";
import { useCreateInstitution } from "../../controller/mutations";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import { useTeachersListQuery } from "@/modules/teacher/controller/queries";
import type { InstitutionCreateDto } from "../../model/institution.types";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";

export const InstitutionCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createInstitutionMutation = useCreateInstitution();
  const [isOpen, setIsOpen] = useState(true);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstitutionFormData>({
    resolver: zodResolver(createInstitutionSchema(t)),
    mode: "onChange",
    disabled: createInstitutionMutation.isPending,
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

  // Set default district when districts are loaded
  useEffect(() => {
    if (districtList.length > 0 && !districtCode) {
      setValue("district", districtList[0].code);
    }
  }, [districtList, districtCode, setValue]);

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
    } else {
      // Clear fields when no teacher is selected
      setValue("contactPhoneNumber", "");
      setValue("contactEmail", "");
    }
  }, [selectedTeacher, setValue]);

  const onSubmit = async (data: CreateInstitutionFormData) => {
    try {
      // Find district ID from district code
      const district = districtList.find((d) => d.code === data.district);

      // Map form data to API DTO format
      const createDto: InstitutionCreateDto = {
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

      await createInstitutionMutation.mutateAsync(createDto);
      // Navigate to institution list page on success
      navigate(ROUTES.ADMIN_INSTITUTION_FULL);
    } catch (error) {
      // Error handling is done by the mutation
      // Stay on current page on error
      console.error("Failed to create institution:", error);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={createInstitutionMutation.isPending} />
      <PageLayout
        title="Create Institution"
        breadcrumbRoot="institution"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.ADMIN_INSTITUTION_FULL)}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isSubmitting || createInstitutionMutation.isPending}
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
                      {t("institution.institutionInformation")}
                    </h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                        <span className="sr-only">
                          {isOpen ? "Collapse" : "Expand"}
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
                        disabled={
                          isSubmitting || createInstitutionMutation.isPending
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
                        disabled={
                          isSubmitting || createInstitutionMutation.isPending
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
                              placeholder={t("institution.districtPlaceholder")}
                              value={districtDisplayValue}
                              onChange={field.onChange}
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
                        isSubmitting || createInstitutionMutation.isPending
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
                      <Input
                        id="streetRoad"
                        type="text"
                        placeholder={t("institution.streetRoadPlaceholder")}
                        {...register("streetRoad")}
                        className={
                          errors.streetRoad ? "ring-2 ring-destructive" : ""
                        }
                        disabled={
                          isSubmitting || createInstitutionMutation.isPending
                        }
                      />
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
                        placeholder={t("institution.detailAddressPlaceholder")}
                        {...register("detailAddress")}
                        className={
                          errors.detailAddress ? "ring-2 ring-destructive" : ""
                        }
                        disabled={
                          isSubmitting || createInstitutionMutation.isPending
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
                        isSubmitting || createInstitutionMutation.isPending
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
                        isSubmitting || createInstitutionMutation.isPending
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
                        isSubmitting || createInstitutionMutation.isPending
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
                        isSubmitting || createInstitutionMutation.isPending
                      }
                    />
                  </div>

                  {/* Notes */}
                  <div className="mt-4 py-1">
                    <FormField id="notes" label="Notes" error={errors.notes}>
                      <Textarea
                        id="notes"
                        placeholder="Please enter notes."
                        {...register("notes")}
                        className={
                          errors.notes ? "ring-2 ring-destructive" : ""
                        }
                        disabled={
                          isSubmitting || createInstitutionMutation.isPending
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
                        isSubmitting || createInstitutionMutation.isPending
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
        </div>
      </PageLayout>
    </>
  );
};
