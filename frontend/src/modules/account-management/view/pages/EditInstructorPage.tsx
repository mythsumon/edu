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
import { FormSelectField } from '../components/FormSelectField'
import { FormDatePickerField } from '../components/FormDatePickerField'
import { CollapsibleCard } from '../components/CollapsibleCard'

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
      city: '',
      street: '',
      detailAddress: '',
      statusId: '',
      classificationId: '',
      affiliation: '',
    },
  })

  const selectedRegionId = watch('regionId')

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

  // Fetch city common code
  const { data: cityCommonCode } = useCommonCodeByCodeQuery(MASTER_CODE_DISTRICT_CODE)

  // Fetch status master codes (parent code 100)
  const { data: statusMasterCodesData, isLoading: isLoadingStatusCodes } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  )
  const statusMasterCodes = statusMasterCodesData?.items || []

  // Fetch classification master codes (parent code 200)
  const { data: classificationMasterCodesData, isLoading: isLoadingClassificationCodes } =
    useMasterCodeChildrenByCodeQuery(MASTER_CODE_PARENT_CODES.INSTRUCTOR_CLASSIFICATION)
  const classificationMasterCodes = classificationMasterCodesData?.items || []

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

      // Determine city value - use instructor's city or default from common code
      const cityValue = instructor.city || cityCommonCode?.codeName || ''

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
        city: cityValue,
        street: instructor.street || '',
        detailAddress: instructor.detailAddress || '',
        statusId: instructor.statusId ? String(instructor.statusId) : '',
        classificationId: instructor.classificationId ? String(instructor.classificationId) : '',
        affiliation: instructor.affiliation || '',
      })
    }
  }, [instructor, regions, zones, cityCommonCode, reset])

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
          city: data.city,
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
              <FormSelectField
                id="gender"
                name="gender"
                label={t('accountManagement.gender')}
                placeholder={t('accountManagement.genderPlaceholder')}
                control={control}
                options={GENDER_OPTIONS}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                error={errors.gender}
                required
                isSubmitting={isSubmitting}
              />

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
              <FormInputField
                id="city"
                label={t('accountManagement.city')}
                placeholder={t('accountManagement.cityPlaceholder')}
                register={register('city')}
                error={errors.city}
                required
                isSubmitting={isSubmitting}
                disabled
              />

              {/* Zone */}
              <FormSelectField
                id="zoneId"
                name="zoneId"
                label={t('accountManagement.zone')}
                placeholder={t('accountManagement.zoneAutoSelected')}
                control={control}
                options={zones}
                getOptionValue={(option) => String(option.id)}
                getOptionLabel={(option) => option.codeName || ''}
                error={errors.zoneId}
                required
                isSubmitting={isSubmitting}
                disabled
                isLoading={isLoadingZones}
                onValueChange={() => { }} // Disabled - auto-selected
                displayValue={(value) => {
                  const selectedZone = value ? zones.find((z) => String(z.id) === value) : null
                  return selectedZone ? selectedZone.codeName : t('accountManagement.zoneAutoSelected')
                }}
              />

              {/* Region */}
              <FormSelectField
                id="regionId"
                name="regionId"
                label={t('accountManagement.region')}
                placeholder={t('accountManagement.regionPlaceholder')}
                control={control}
                options={regions}
                getOptionValue={(option) => String(option.id)}
                getOptionLabel={(option) => option.codeName || ''}
                error={errors.regionId}
                required
                isSubmitting={isSubmitting}
                isLoading={isLoadingRegions}
              />

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
              <FormSelectField
                id="statusId"
                name="statusId"
                label={t('accountManagement.status')}
                placeholder={t('accountManagement.statusPlaceholder')}
                control={control}
                options={statusMasterCodes}
                getOptionValue={(option) => String(option.id)}
                getOptionLabel={(option) => option.codeName || ''}
                error={errors.statusId}
                required
                isSubmitting={isSubmitting}
                isLoading={isLoadingStatusCodes}
              />
              {/* Classification */}
              <FormSelectField
                id="classificationId"
                name="classificationId"
                label={t('accountManagement.classification')}
                placeholder={t('accountManagement.classificationPlaceholder')}
                control={control}
                options={classificationMasterCodes}
                getOptionValue={(option) => String(option.id)}
                getOptionLabel={(option) => option.codeName || ''}
                error={errors.classificationId}
                required
                isSubmitting={isSubmitting}
                isLoading={isLoadingClassificationCodes}
              />
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
