import { useTranslation } from "react-i18next";
import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { FormMultiSelectDropdownField } from "./FormMultiSelectDropdownField";
import { FormRegionGroupedField } from "./FormRegionGroupedField";
import {
  useMasterCodeChildrenQuery,
  useMasterCodeGrandChildrenQuery,
} from "../../controller/queries";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import { useForm, FieldError } from "react-hook-form";

interface InstitutionFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (filters: InstitutionFilterData) => void;
}

export interface InstitutionFilterData {
  institutionLevelClassification?: string | string[];
  zone?: string | string[];
  region?: string | string[];
  majorCategory?: string | string[];
  category1?: string | string[];
  category2?: string | string[];
}

interface FilterFormData {
  institutionLevelClassification: string[];
  zone: string[];
  region: string[];
  majorCategory: string[];
  category1: string[];
  category2: string[];
}

export const InstitutionFilterDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: InstitutionFilterDialogProps) => {
  const { t } = useTranslation();
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Fetch districts
  const { data: districts } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.DISTRICT
  );
  const districtList = useMemo(() => districts?.items || [], [districts?.items]);

  // Set default district when districts are loaded
  useEffect(() => {
    if (districtList.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districtList[0].code);
    }
  }, [districtList, selectedDistrict]);

  // Fetch zones (children of districts)
  const { data: zonesData } = useMasterCodeChildrenQuery(
    selectedDistrict,
    undefined,
    !!selectedDistrict
  );
  const zoneList = useMemo(() => zonesData?.items || [], [zonesData?.items]);

  // Fetch regions (grandchildren of districts)
  const { data: regionsData } = useMasterCodeGrandChildrenQuery(
    selectedDistrict,
    undefined,
    !!selectedDistrict
  );
  const regionList = useMemo(() => regionsData?.items || [], [regionsData?.items]);

  // Fetch institution level classification
  const { data: institutionLevelData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.INSTITUTION_LEVEL_CLASSIFICATION
  );
  const institutionLevelList = useMemo(
    () => institutionLevelData?.items || [],
    [institutionLevelData?.items]
  );

  // Fetch major category
  const { data: majorCategories } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.MAJOR_CATEGORY
  );
  const majorCategoryList = useMemo(
    () => majorCategories?.items || [],
    [majorCategories?.items]
  );

  // Fetch category 1
  const { data: category1Data } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.CATEGORY1
  );
  const category1List = useMemo(
    () => category1Data?.items || [],
    [category1Data?.items]
  );

  // Fetch category 2
  const { data: category2Data } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.CATEGORY2
  );
  const category2List = useMemo(
    () => category2Data?.items || [],
    [category2Data?.items]
  );

  // Transform API data to options format
  const institutionLevelOptions = useMemo(
    () =>
      institutionLevelList.map((level) => ({
        value: String(level.id),
        label: level.codeName,
      })),
    [institutionLevelList]
  );

  const zoneOptions = useMemo(
    () =>
      zoneList.map((zone) => ({
        value: String(zone.id),
        label: zone.codeName,
      })),
    [zoneList]
  );

  // Transform category data to options format
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FilterFormData>({
    defaultValues: {
      institutionLevelClassification: [],
      zone: [],
      region: [],
      majorCategory: [],
      category1: [],
      category2: [],
    },
  });

  // Watch selected zones to filter regions
  const selectedZones = watch("zone");

  // Helper to extract error from array field errors
  const getFieldError = (error: unknown) => {
    if (Array.isArray(error)) {
      return error[0];
    }
    return error as FieldError | undefined;
  };

  const handleReset = () => {
    reset({
      institutionLevelClassification: [],
      zone: [],
      region: [],
      majorCategory: [],
      category1: [],
      category2: [],
    });
    setSelectedDistrict(districtList.length > 0 ? districtList[0].code : "");
  };

  const handleConfirm = (data: FilterFormData) => {
    const filterData: InstitutionFilterData = {
      institutionLevelClassification:
        data.institutionLevelClassification.length > 0
          ? data.institutionLevelClassification
          : undefined,
      zone:
        data.zone.length > 0
          ? data.zone
          : undefined,
      region:
        data.region.length > 0
          ? data.region
          : undefined,
      majorCategory:
        data.majorCategory.length > 0
          ? data.majorCategory
          : undefined,
      category1:
        data.category1.length > 0
          ? data.category1
          : undefined,
      category2:
        data.category2.length > 0
          ? data.category2
          : undefined,
    };
    onConfirm?.(filterData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">{t("institution.filter")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("institution.filterDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <div className="space-y-2 py-0">
            {/* Institution Level Classification */}
            <FormMultiSelectDropdownField
              id="institutionLevelClassification"
              name="institutionLevelClassification"
              label={t("institution.institutionLevelClassificationLabel")}
              placeholder={t("institution.institutionLevelClassificationPlaceholder")}
              control={control}
              options={institutionLevelOptions}
              error={
                Array.isArray(errors.institutionLevelClassification)
                  ? errors.institutionLevelClassification[0]
                  : errors.institutionLevelClassification
              }
            />

            {/* Zone */}
            <FormMultiSelectDropdownField
              id="zone"
              name="zone"
              label={t("institution.zoneLabel")}
              placeholder={t("institution.zonePlaceholder")}
              control={control}
              options={zoneOptions}
              error={getFieldError(errors.zone)}
            />

            {/* Region */}
            <FormRegionGroupedField
              id="region"
              name="region"
              label={t("institution.regionLabel")}
              placeholder={t("institution.regionPlaceholder")}
              control={control}
              selectedZones={Array.isArray(selectedZones) ? selectedZones : []}
              zoneOptions={zoneOptions}
              allRegions={regionList}
              error={getFieldError(errors.region)}
            />

            {/* Major Category */}
            <FormMultiSelectDropdownField
              id="majorCategory"
              name="majorCategory"
              label={t("institution.majorCategoryLabel")}
              placeholder={t("institution.majorCategoryPlaceholder")}
              control={control}
              options={majorCategoryOptions}
              error={getFieldError(errors.majorCategory)}
            />

            {/* Category 1 */}
            <FormMultiSelectDropdownField
              id="category1"
              name="category1"
              label={t("institution.category1Label")}
              placeholder={t("institution.category1Placeholder")}
              control={control}
              options={category1Options}
              error={getFieldError(errors.category1)}
            />

            {/* Category 2 */}
            <FormMultiSelectDropdownField
              id="category2"
              name="category2"
              label={t("institution.category2Label")}
              placeholder={t("institution.category2Placeholder")}
              control={control}
              options={category2Options}
              error={getFieldError(errors.category2)}
            />
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="px-7"
              onClick={handleReset}
            >
              {t("common.reset")}
            </Button>
            <Button type="submit" className="px-7">
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
