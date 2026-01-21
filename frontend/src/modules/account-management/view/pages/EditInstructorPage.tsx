import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useMemo } from 'react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { useUpdateInstructor } from '../../controller/mutations'
import { useInstructorDetailQuery } from '../../controller/queries'
import { updateInstructorSchema, type UpdateInstructorFormData } from '../../model/account-management.schema'
import { useMasterCodeChildrenByCodeQuery } from '@/modules/master-code-setup/controller/queries'
import { MASTER_CODE_PARENT_CODES, MASTER_CODE_DISTRICT_CODE } from '@/shared/constants/master-code'
import { useCommonCodeByCodeQuery, useCommonCodeGrandChildrenByCodeQuery, useCommonCodeChildrenByCodeQuery } from '@/modules/common-code/controller/queries'
import { GENDER_OPTIONS } from '@/shared/constants/users'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { FormInputField } from '../components/FormInputField'
import { FormDatePickerField } from '../components/FormDatePickerField'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { FormField } from '../components/FormField'
import { Input } from '@/shared/ui/input'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { BackToTop } from '@/shared/components/BackToTop'

export const EditInstructorPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const instructorId = id ? parseInt(id, 10) : 0
  const updateInstructorMutation = useUpdateInstructor()
  const formRef = useRef<HTMLFormElement>(null)

  const { data: instructor, isLoading: isLoadingInstructor, error: instructorError } = useInstructorDetailQuery(instructorId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInstructorFormData>({
    resolver: zodResolver(updateInstructorSchema(t)),
    mode: 'onChange',
    defaultValues: {
      username: '',
      name: '',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      zoneId: '',
      regionId: '',
      cityId: '',
      street: '',
      detailAddress: '',
      statusId: '',
      classificationId: '',
      affiliation: '',
    },
  })

  const selectedRegionId = watch('regionId')
  const genderValue = watch('gender')
  const zoneIdValue = watch('zoneId')
  const statusIdValue = watch('statusId')
  const classificationIdValue = watch('classificationId')

  // Fetch zones from common code (children of zone/region parent code)
  const { data: zonesData, isLoading: isLoadingZones } = useCommonCodeChildrenByCodeQuery(
    MASTER_CODE_DISTRICT_CODE
  )
  const zones = useMemo(() => zonesData?.items || [], [zonesData?.items])

  // Fetch regions from common code (grandchildren of zone/region parent code)
  const { data: regionsData, isLoading: isLoadingRegions } = useCommonCodeGrandChildrenByCodeQuery(
    MASTER_CODE_DISTRICT_CODE
  )
  const regions = useMemo(() => regionsData?.items || [], [regionsData?.items])

  // Fetch city master code (code '500-1')
  const { data: cityMasterCode } = useCommonCodeByCodeQuery('500-1')

  // Fetch status master codes (parent code 100)
  const { data: statusMasterCodesData, isLoading: isLoadingStatusCodes } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  )
  const statusMasterCodes = statusMasterCodesData?.items || []

  // Fetch classification master codes (parent code 200)
  const { data: classificationMasterCodesData, isLoading: isLoadingClassificationCodes } =
    useMasterCodeChildrenByCodeQuery(MASTER_CODE_PARENT_CODES.INSTRUCTOR_CLASSIFICATION)
  const classificationMasterCodes = classificationMasterCodesData?.items || []

  // Transform options to DropdownOption format
  const genderOptions: DropdownOption[] = useMemo(
    () => GENDER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    []
  )

  const regionOptions: DropdownOption[] = useMemo(
    () => regions.map((region) => ({ value: String(region.id), label: region.codeName || '' })),
    [regions]
  )

  const statusOptions: DropdownOption[] = useMemo(
    () => statusMasterCodes.map((status) => ({ value: String(status.id), label: status.codeName || '' })),
    [statusMasterCodes]
  )

  const classificationOptions: DropdownOption[] = useMemo(
    () => classificationMasterCodes.map((classification) => ({ value: String(classification.id), label: classification.codeName || '' })),
    [classificationMasterCodes]
  )

  // Get zone name from zoneId for display
  const zoneDisplayName = useMemo(() => {
    if (!zoneIdValue) return ''
    const zone = zones.find((z) => String(z.id) === zoneIdValue)
    return zone?.codeName || ''
  }, [zoneIdValue, zones])

  // Pre-fill form with instructor data using reset() to properly initialize and clear validation errors
  useEffect(() => {
    if (instructor && regions.length > 0 && zones.length > 0) {
      // Find zoneId if regionId exists
      let zoneId = ''
      if (instructor.regionId) {
        const selectedRegion = regions.find((r) => r.id === instructor.regionId)
        if (selectedRegion && selectedRegion.parentId) {
          const matchingZone = zones.find((z) => z.id === selectedRegion.parentId)
          if (matchingZone) {
            zoneId = String(matchingZone.id)
          }
        }
      }

      // Use reset() to set all values at once and clear validation errors
      reset({
        username: instructor.username,
        name: instructor.name,
        email: instructor.email || '',
        phone: instructor.phone || '',
        gender: instructor.gender || '',
        dob: instructor.dob || '',
        zoneId: zoneId,
        regionId: instructor.regionId ? String(instructor.regionId) : '',
        cityId: instructor.cityId ? String(instructor.cityId) : (cityMasterCode?.id ? String(cityMasterCode.id) : ''),
        street: instructor.street || '',
        detailAddress: instructor.detailAddress || '',
        statusId: instructor.statusId ? String(instructor.statusId) : '',
        classificationId: instructor.classificationId ? String(instructor.classificationId) : '',
        affiliation: instructor.affiliation || '',
      })
    }
  }, [instructor, regions, zones, cityMasterCode, reset])

  // Auto-select zone when region is selected (using parentId from common code)
  useEffect(() => {
    if (selectedRegionId) {
      const selectedRegion = regions.find((r) => String(r.id) === selectedRegionId)
      if (selectedRegion && selectedRegion.parentId) {
        // Find zone by matching parentId
        const matchingZone = zones.find((z) => z.id === selectedRegion.parentId)
        if (matchingZone) {
          setValue('zoneId', String(matchingZone.id))
        }
      }
    } else {
      // Clear zone when region is cleared
      setValue('zoneId', '')
    }
  }, [selectedRegionId, regions, zones, setValue])

  // Set city default value from common code if not already set (only for new instructors, not when editing)
  // This is handled in the reset() call above, so this effect is not needed for edit mode

  const onSubmit = async (data: UpdateInstructorFormData) => {
    try {
      await updateInstructorMutation.mutateAsync({
        id: instructorId,
        data: {
          username: data.username,
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          dob: data.dob,
          regionId: Number(data.regionId),
          cityId: Number(data.cityId),
          street: data.street,
          detailAddress: data.detailAddress,
          statusId: Number(data.statusId),
          classificationId: Number(data.classificationId),
          affiliation: data.affiliation || undefined,
        },
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.updateInstructorSuccess'),
        variant: 'success',
      })
      navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL}/${instructorId}`)
    } catch (error) {
      // Extract error message from the error object
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountManagement.updateInstructorError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update instructor:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_DETAIL_FULL.replace(':id', String(instructorId)))
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  if (isLoadingInstructor) {
    return <LoadingState />
  }

  if (instructorError || !instructor) {
    return <ErrorState error={instructorError || undefined} />
  }

  return (
    <PageLayout
      title={t('accountManagement.editInstructor')}
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL, label: t('accountManagement.instructors') }}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('accountManagement.updating') : t('accountManagement.updateInstructor')}
          </Button>
        </>
      }
    >
      <div className="max-w-4xl p-6 mx-auto">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Collapsible Card */}
          <CollapsibleCard
            title={t('accountManagement.basicInformation')}
            description={t('accountManagement.basicInformationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Instructor ID */}
              <FormInputField
                id="username"
                label={t('accountManagement.instructorId')}
                placeholder={t('accountManagement.instructorIdPlaceholder')}
                register={register('username')}
                error={errors.username}
                required
                isSubmitting={isSubmitting}
              />

              {/* Name */}
              <FormInputField
                id="name"
                label={t('accountManagement.name')}
                placeholder={t('accountManagement.namePlaceholder')}
                register={register('name')}
                error={errors.name}
                required
                isSubmitting={isSubmitting}
              />

              {/* Email */}
              <FormInputField
                id="email"
                label={t('accountManagement.email')}
                placeholder={t('accountManagement.emailPlaceholder')}
                type="email"
                register={register('email')}
                error={errors.email}
                required
                isSubmitting={isSubmitting}
              />

              {/* Phone */}
              <FormInputField
                id="phone"
                label={t('accountManagement.phoneNumber')}
                placeholder={t('accountManagement.phoneNumberRequiredPlaceholder')}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                required
                isSubmitting={isSubmitting}
              />

              {/* Gender */}
              <FormField id="gender" label={t('accountManagement.gender')} required error={errors.gender}>
                <CustomDropdownField
                  id="gender"
                  value={genderValue || ''}
                  onChange={(value) => setValue('gender', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.genderPlaceholder')}
                  options={genderOptions}
                  disabled={isSubmitting}
                  hasError={!!errors.gender}
                />
              </FormField>

              {/* Date of Birth */}
              <FormDatePickerField
                id="dob"
                name="dob"
                label={t('accountManagement.dateOfBirth')}
                placeholder={t('accountManagement.dateOfBirthPlaceholder')}
                control={control}
                error={errors.dob}
                required
                isSubmitting={isSubmitting}
              />
            </div>
          </CollapsibleCard>

          {/* Affiliation and Address Information Collapsible Card */}
          <CollapsibleCard
            title={t('accountManagement.addressInformation')}
            description={t('accountManagement.addressInformationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Affiliation */}
              <FormInputField
                id="affiliation"
                label={t('accountManagement.affiliation')}
                placeholder={t('accountManagement.affiliationPlaceholder')}
                register={register('affiliation')}
                error={errors.affiliation}
                isSubmitting={isSubmitting}
              />

              {/* City */}
              <FormField id="city" label={t('accountManagement.city')} required>
                <Input
                  id="city"
                  placeholder={t('accountManagement.cityPlaceholder')}
                  value={cityMasterCode?.codeName || ''}
                  disabled={true}
                />
              </FormField>

              {/* Zone */}
              <FormField id="zoneId" label={t('accountManagement.zone')} required error={errors.zoneId}>
                <Input
                  id="zoneId"
                  placeholder={t('accountManagement.zoneAutoSelected')}
                  value={zoneDisplayName}
                  disabled={true}
                  className={errors.zoneId ? 'ring-2 ring-destructive' : ''}
                />
              </FormField>

              {/* Region */}
              <FormField id="regionId" label={t('accountManagement.region')} required error={errors.regionId}>
                <CustomDropdownField
                  id="regionId"
                  value={selectedRegionId || ''}
                  onChange={(value) => setValue('regionId', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.regionPlaceholder')}
                  options={regionOptions}
                  disabled={isSubmitting || isLoadingRegions}
                  hasError={!!errors.regionId}
                />
              </FormField>

              {/* Street */}
              <FormInputField
                id="street"
                label={t('accountManagement.street')}
                placeholder={t('accountManagement.streetPlaceholder')}
                register={register('street')}
                error={errors.street}
                required
                isSubmitting={isSubmitting}
              />

              {/* Detail Address */}
              <FormInputField
                id="detailAddress"
                label={t('accountManagement.buildingNameLakeNumber')}
                placeholder={t('accountManagement.buildingNameLakeNumberPlaceholder')}
                register={register('detailAddress')}
                error={errors.detailAddress}
                required
                isSubmitting={isSubmitting}
              />
            </div>
          </CollapsibleCard>

          {/* Status and Classification Collapsible Card */}
          <CollapsibleCard
            title={t('accountManagement.statusAndClassification')}
            description={t('accountManagement.statusAndClassificationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Status */}
              <FormField id="statusId" label={t('accountManagement.status')} required error={errors.statusId}>
                <CustomDropdownField
                  id="statusId"
                  value={statusIdValue || ''}
                  onChange={(value) => setValue('statusId', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.statusPlaceholder')}
                  options={statusOptions}
                  disabled={isSubmitting || isLoadingStatusCodes}
                  hasError={!!errors.statusId}
                />
              </FormField>
              {/* Classification */}
              <FormField id="classificationId" label={t('accountManagement.classification')} required error={errors.classificationId}>
                <CustomDropdownField
                  id="classificationId"
                  value={classificationIdValue || ''}
                  onChange={(value) => setValue('classificationId', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.classificationPlaceholder')}
                  options={classificationOptions}
                  disabled={isSubmitting || isLoadingClassificationCodes}
                  hasError={!!errors.classificationId}
                />
              </FormField>
            </div>
          </CollapsibleCard>
        </form>
      </div>
      <BackToTop />
    </PageLayout>
  )
}
