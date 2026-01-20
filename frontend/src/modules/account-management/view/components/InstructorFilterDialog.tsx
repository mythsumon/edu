import { useTranslation } from 'react-i18next'
import { useMemo, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { FormMultiSelectDropdownField } from '@/modules/institution/view/components/FormMultiSelectDropdownField'
import { FormRegionGroupedField } from '@/modules/institution/view/components/FormRegionGroupedField'
import {
  useCommonCodeChildrenByCodeQuery,
  useCommonCodeGrandChildrenByCodeQuery,
} from '@/modules/common-code/controller/queries'
import { MASTER_CODE_PARENT_CODES, MASTER_CODE_DISTRICT_CODE } from '@/shared/constants/master-code'
import { useForm, FieldError } from 'react-hook-form'

interface InstructorFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (filters: InstructorFilterData) => void
}

export interface InstructorFilterData {
  region?: string | string[]
  classification?: string | string[]
  status?: string | string[]
  zone?: string | string[]
}

interface FilterFormData {
  region: string[]
  classification: string[]
  status: string[]
  zone: string[]
}

export const InstructorFilterDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: InstructorFilterDialogProps) => {
  const { t } = useTranslation()
  const [selectedDistrict, setSelectedDistrict] = useState<string>(MASTER_CODE_DISTRICT_CODE)

  // Fetch districts
  const { data: districts } = useCommonCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.DISTRICT
  )
  const districtList = useMemo(() => districts?.items || [], [districts?.items])

  // Set default district when districts are loaded
  useEffect(() => {
    if (districtList.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districtList[0]?.code || MASTER_CODE_DISTRICT_CODE)
    }
  }, [districtList, selectedDistrict])

  // Fetch zones (children of districts)
  const { data: zonesData } = useCommonCodeChildrenByCodeQuery(
    selectedDistrict,
    undefined,
    !!selectedDistrict
  )
  const zoneList = useMemo(() => zonesData?.items || [], [zonesData?.items])

  // Fetch regions (grandchildren of districts)
  const { data: regionsData } = useCommonCodeGrandChildrenByCodeQuery(
    selectedDistrict,
    undefined,
    !!selectedDistrict
  )
  const regionList = useMemo(() => regionsData?.items || [], [regionsData?.items])

  // Fetch instructor classification
  const { data: classificationData } = useCommonCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.INSTRUCTOR_CLASSIFICATION
  )
  const classificationList = useMemo(
    () => classificationData?.items || [],
    [classificationData?.items]
  )

  // Fetch status
  const { data: statusData } = useCommonCodeChildrenByCodeQuery(MASTER_CODE_PARENT_CODES.STATUS)
  const statusList = useMemo(() => statusData?.items || [], [statusData?.items])

  // Transform API data to options format
  const classificationOptions = useMemo(
    () =>
      classificationList.map((item) => ({
        value: String(item.id),
        label: item.codeName,
      })),
    [classificationList]
  )

  const statusOptions = useMemo(
    () =>
      statusList.map((item) => ({
        value: String(item.id),
        label: item.codeName,
      })),
    [statusList]
  )

  const zoneOptions = useMemo(
    () =>
      zoneList.map((zone) => ({
        value: String(zone.id),
        label: zone.codeName,
      })),
    [zoneList]
  )

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FilterFormData>({
    defaultValues: {
      region: [],
      classification: [],
      status: [],
      zone: [],
    },
  })

  // Watch selected zones to filter regions
  const selectedZones = watch('zone')

  // Helper to extract error from array field errors
  const getFieldError = (error: unknown) => {
    if (Array.isArray(error)) {
      return error[0]
    }
    return error as FieldError | undefined
  }

  const handleReset = () => {
    reset({
      region: [],
      classification: [],
      status: [],
      zone: [],
    })
    setSelectedDistrict(
      districtList.length > 0 ? districtList[0]?.code || MASTER_CODE_DISTRICT_CODE : MASTER_CODE_DISTRICT_CODE
    )
  }

  const handleConfirm = (data: FilterFormData) => {
    const filterData: InstructorFilterData = {
      region: data.region.length > 0 ? data.region : undefined,
      classification: data.classification.length > 0 ? data.classification : undefined,
      status: data.status.length > 0 ? data.status : undefined,
      zone: data.zone.length > 0 ? data.zone : undefined,
    }
    onConfirm?.(filterData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {t('accountManagement.filter')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('accountManagement.filterDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <div className="space-y-2 py-0">
            {/* Status */}
            <FormMultiSelectDropdownField
              id="status"
              name="status"
              label={t('accountManagement.statusLabel')}
              placeholder={t('accountManagement.statusPlaceholder')}
              control={control}
              options={statusOptions}
              error={getFieldError(errors.status)}
            />

            {/* Instructor Classification */}
            <FormMultiSelectDropdownField
              id="classification"
              name="classification"
              label={t('accountManagement.classificationLabel')}
              placeholder={t('accountManagement.classificationPlaceholder')}
              control={control}
              options={classificationOptions}
              error={getFieldError(errors.classification)}
            />

            {/* Zone */}
            <FormMultiSelectDropdownField
              id="zone"
              name="zone"
              label={t('accountManagement.zoneLabel')}
              placeholder={t('accountManagement.zonePlaceholder')}
              control={control}
              options={zoneOptions}
              error={getFieldError(errors.zone)}
            />

            {/* Region */}
            <FormRegionGroupedField
              id="region"
              name="region"
              label={t('accountManagement.regionLabel')}
              placeholder={t('accountManagement.regionPlaceholder')}
              control={control}
              selectedZones={Array.isArray(selectedZones) ? selectedZones : []}
              zoneOptions={zoneOptions}
              allRegions={regionList}
              error={getFieldError(errors.region)}
            />
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
            <Button type="button" variant="outline" className="px-7" onClick={handleReset}>
              {t('common.reset')}
            </Button>
            <Button type="submit" className="px-7">
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
