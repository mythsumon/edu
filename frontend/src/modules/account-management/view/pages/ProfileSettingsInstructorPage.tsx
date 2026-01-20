import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { useUpdateOwnProfile } from '../../controller/mutations'
import { useInstructorMeQuery } from '../../controller/queries'
import { updateOwnProfileInstructorSchema, type UpdateOwnProfileInstructorFormData } from '../../model/account-management.schema'
import { useCommonCodeChildrenByCodeQuery, useCommonCodeGrandChildrenByCodeQuery, useCommonCodeByCodeQuery } from '@/modules/common-code/controller/queries'
import { MASTER_CODE_DISTRICT_CODE } from '@/shared/constants/master-code'
import { GENDER_OPTIONS } from '@/shared/constants/users'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { FormInputField } from '../components/FormInputField'
import { FormDatePickerField } from '../components/FormDatePickerField'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { FormField } from '../components/FormField'
import { Input } from '@/shared/ui/input'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { getCurrentUser } from '@/modules/auth/model/auth.service'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

export const ProfileSettingsInstructorPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const updateProfileMutation = useUpdateOwnProfile()
  const formRef = useRef<HTMLFormElement>(null)
  const [user, setUser] = useState<UserResponseDto | null>(null)

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER)
        if (userStr) {
          setUser(JSON.parse(userStr))
        }
      } catch (error) {
        console.error('Failed to load user from localStorage:', error)
      }
    }
    loadUser()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        loadUser()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const username = user?.username || ''
  const { data: instructor, isLoading: isLoadingInstructor, error: instructorError } = useInstructorMeQuery()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UpdateOwnProfileInstructorFormData>({
    resolver: zodResolver(updateOwnProfileInstructorSchema(t)),
    mode: 'onChange',
    defaultValues: {
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
      affiliation: '',
    },
  })

  const selectedRegionId = watch('regionId')
  const genderValue = watch('gender')
  const zoneIdValue = watch('zoneId')

  // Fetch zones and regions
  const { data: zonesData } = useCommonCodeChildrenByCodeQuery(MASTER_CODE_DISTRICT_CODE)
  const zones = useMemo(() => zonesData?.items || [], [zonesData?.items])

  const { data: regionsData } = useCommonCodeGrandChildrenByCodeQuery(MASTER_CODE_DISTRICT_CODE)
  const regions = useMemo(() => regionsData?.items || [], [regionsData?.items])

  const { data: cityMasterCode } = useCommonCodeByCodeQuery('500-1')

  const genderOptions: DropdownOption[] = useMemo(
    () => GENDER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    []
  )

  const regionOptions: DropdownOption[] = useMemo(
    () => regions.map((region) => ({ value: String(region.id), label: region.codeName || '' })),
    [regions]
  )

  const zoneDisplayName = useMemo(() => {
    if (!zoneIdValue) return ''
    const zone = zones.find((z) => String(z.id) === zoneIdValue)
    return zone?.codeName || ''
  }, [zoneIdValue, zones])

  // Pre-fill form with instructor data
  useEffect(() => {
    if (instructor && regions.length > 0 && zones.length > 0) {
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

      reset({
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
        affiliation: instructor.affiliation || '',
      })
    }
  }, [instructor, regions, zones, cityMasterCode, reset])

  // Auto-select zone when region is selected
  useEffect(() => {
    if (selectedRegionId) {
      const selectedRegion = regions.find((r) => String(r.id) === selectedRegionId)
      if (selectedRegion && selectedRegion.parentId) {
        const matchingZone = zones.find((z) => z.id === selectedRegion.parentId)
        if (matchingZone) {
          setValue('zoneId', String(matchingZone.id))
        }
      }
    } else {
      setValue('zoneId', '')
    }
  }, [selectedRegionId, regions, zones, setValue])

  const onSubmit = async (data: UpdateOwnProfileInstructorFormData) => {
    if (!user || !username) return

    try {
      await updateProfileMutation.mutateAsync({
        username,
        roleName: user.roleName,
        data: {
          ...data,
          // username is not needed for /instructor/me endpoint
        },
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.updateProfileSuccess'),
        variant: 'success',
      })
      // Refresh user data in localStorage
      try {
        const updatedUser = await getCurrentUser()
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
        setUser(updatedUser)
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountManagement.updateProfileError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.INSTRUCTOR_DASHBOARD_FULL)
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
      title={t('accountManagement.profileSettings')}
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
            disabled={isSubmitting || updateProfileMutation.isPending}
          >
            {isSubmitting || updateProfileMutation.isPending
              ? t('accountManagement.updating')
              : t('common.update')}
          </Button>
        </>
      }
    >
      <div className="max-w-4xl p-6 mx-auto">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CollapsibleCard
            title={t('accountManagement.basicInformation')}
            description={t('accountManagement.basicInformationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('accountManagement.username')}
                </label>
                <Input
                  value={username}
                  disabled
                  className="bg-muted"
                />
              </div>
              <FormInputField
                id="name"
                label={t('accountManagement.name')}
                placeholder={t('accountManagement.namePlaceholder')}
                register={register('name')}
                error={errors.name}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
              <FormInputField
                id="email"
                label={t('accountManagement.email')}
                placeholder={t('accountManagement.emailPlaceholder')}
                type="email"
                register={register('email')}
                error={errors.email}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
              <FormInputField
                id="phone"
                label={t('accountManagement.phoneNumber')}
                placeholder={t('accountManagement.phoneNumberRequiredPlaceholder')}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
              <FormField id="gender" label={t('accountManagement.gender')} required error={errors.gender}>
                <CustomDropdownField
                  id="gender"
                  value={genderValue || ''}
                  onChange={(value) => setValue('gender', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.genderPlaceholder')}
                  options={genderOptions}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  hasError={!!errors.gender}
                />
              </FormField>
              <FormDatePickerField
                id="dob"
                name="dob"
                label={t('accountManagement.dateOfBirth')}
                placeholder={t('accountManagement.dateOfBirthPlaceholder')}
                control={control}
                error={errors.dob}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title={t('accountManagement.addressInformation')}
            description={t('accountManagement.addressInformationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FormInputField
                id="affiliation"
                label={t('accountManagement.affiliation')}
                placeholder={t('accountManagement.affiliationPlaceholder')}
                register={register('affiliation')}
                error={errors.affiliation}
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
              <FormField id="city" label={t('accountManagement.city')} required>
                <Input
                  id="city"
                  placeholder={t('accountManagement.cityPlaceholder')}
                  value={cityMasterCode?.codeName || ''}
                  disabled={true}
                />
              </FormField>
              <FormField id="zoneId" label={t('accountManagement.zone')} required error={errors.zoneId}>
                <Input
                  id="zoneId"
                  placeholder={t('accountManagement.zoneAutoSelected')}
                  value={zoneDisplayName}
                  disabled={true}
                  className={errors.zoneId ? 'ring-2 ring-destructive' : ''}
                />
              </FormField>
              <FormField id="regionId" label={t('accountManagement.region')} required error={errors.regionId}>
                <CustomDropdownField
                  id="regionId"
                  value={selectedRegionId || ''}
                  onChange={(value) => setValue('regionId', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.regionPlaceholder')}
                  options={regionOptions}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  hasError={!!errors.regionId}
                />
              </FormField>
              <FormInputField
                id="street"
                label={t('accountManagement.street')}
                placeholder={t('accountManagement.streetPlaceholder')}
                register={register('street')}
                error={errors.street}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
              <FormInputField
                id="detailAddress"
                label={t('accountManagement.buildingNameLakeNumber')}
                placeholder={t('accountManagement.buildingNameLakeNumberPlaceholder')}
                register={register('detailAddress')}
                error={errors.detailAddress}
                required
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
