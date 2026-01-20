import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/ui/card'
import { FormInputField } from '@/modules/account-management/view/components/FormInputField'
import { FormField } from '@/modules/account-management/view/components/FormField'
import { FormDatePickerField } from '@/modules/account-management/view/components/FormDatePickerField'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/ui/use-toast'
import { updateInstructorProfileSchema, type UpdateInstructorProfileFormData } from '../../model/instructor-profile.schema'
import { GENDER_OPTIONS } from '@/shared/constants/users'
import type { PageResponse, MasterCodeResponseDto } from '../../model/instructor-profile.types'
import { usePatchInstructor } from '../../controller/mutations'
import { useUiStore } from '@/shared/stores/ui.store'
import i18n from '@/app/config/i18n'

const INTERFACE_LANGUAGES: DropdownOption[] = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
]

interface InstructorProfileEditViewProps {
  instructor: {
    id: number
    name: string
    email: string
    phone: string
    gender: string
    dob: string
    street: string
    detailAddress: string
    cityId?: number
    regionId?: number
  }
  cityMasterCode?: PageResponse<MasterCodeResponseDto>
  cityMasterCodeMap: Record<string, Omit<MasterCodeResponseDto, 'id'>>
  regions: Array<{ id: number; codeName: string }>
  cities: Array<{ id: number; codeName: string }>
  isLoadingRegions: boolean
  language: string
  onSuccess: () => void
  onCancel: () => void
  getInitials: (name: string) => string
  formRef?: React.RefObject<HTMLFormElement>
  onSubmittingChange?: (isSubmitting: boolean) => void
}

export const InstructorProfileEditView = ({
  instructor,
  cityMasterCode,
  cityMasterCodeMap,
  regions,
  cities,
  isLoadingRegions,
  language,
  onSuccess,
  onCancel,
  getInitials,
  formRef: externalFormRef,
  onSubmittingChange,
}: InstructorProfileEditViewProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { setLanguage } = useUiStore()
  const patchInstructorMutation = usePatchInstructor()
  const internalFormRef = useRef<HTMLFormElement>(null)
  const formRef = externalFormRef || internalFormRef

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateInstructorProfileFormData>({
    resolver: zodResolver(updateInstructorProfileSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      gender: '',
      dob: '',
      regionId: '',
      cityId: '',
      street: '',
      detailAddress: '',
      interfaceLanguage: language || 'ko',
    },
  })

  const isSubmitting = patchInstructorMutation.isPending

  const interfaceLanguageValue = watch('interfaceLanguage')
  const genderValue = watch('gender')
  const selectedRegionId = watch('regionId')
  const cityIdValue = watch('cityId')

  // Pre-fill form with instructor data
  useEffect(() => {
    if (regions.length > 0) {
      const defaultCityId = instructor.cityId 
        ? String(instructor.cityId) 
        : (cityMasterCode?.items?.[0]?.id ? String(cityMasterCode.items[0].id) : '')
      
      reset({
        name: instructor.name || '',
        phone: instructor.phone || '',
        gender: instructor.gender || '',
        dob: instructor.dob || '',
        regionId: instructor.regionId ? String(instructor.regionId) : '',
        cityId: defaultCityId,
        street: instructor.street || '',
        detailAddress: instructor.detailAddress || '',
        interfaceLanguage: language || 'ko',
      })
    }
  }, [reset, instructor, regions.length, cityMasterCode, language])

  // Set cityId when cityMasterCode loads if not already set
  useEffect(() => {
    if (cityMasterCode?.items?.[0]?.id && !watch('cityId')) {
      setValue('cityId', String(cityMasterCode.items[0].id), { shouldValidate: false })
    }
  }, [cityMasterCode, setValue, watch])

  // Notify parent of submitting state changes
  useEffect(() => {
    onSubmittingChange?.(isSubmitting)
  }, [isSubmitting, onSubmittingChange])

  // Handle form submission
  const onSubmit = async (data: UpdateInstructorProfileFormData) => {
    try {
      // Update interface language if changed
      if (data.interfaceLanguage !== language) {
        setLanguage(data.interfaceLanguage as 'en' | 'ko')
        i18n.changeLanguage(data.interfaceLanguage)
      }

      // Prepare request data
      const requestData = {
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        regionId: data.regionId ? Number(data.regionId) : undefined,
        cityId: data.cityId ? Number(data.cityId) : undefined,
        street: data.street,
        detailAddress: data.detailAddress,
      }

      // Call mutation
      await patchInstructorMutation.mutateAsync({
        userId: instructor.id,
        data: requestData,
      })

      // Show success message
      toast({
        title: t('common.success'),
        description: t('profile.updateSuccess'),
        variant: 'success',
      })

      // Call success callback to close edit mode
      onSuccess()
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('profile.updateError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update profile:', error)
    }
  }

  // Transform options to DropdownOption format
  const genderOptions: DropdownOption[] = useMemo(
    () => GENDER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    []
  )

  const regionOptions: DropdownOption[] = useMemo(
    () => regions.map((region: { id: number; codeName: string }) => ({ value: String(region.id), label: region.codeName || '' })),
    [regions]
  )

  const cityOptions: DropdownOption[] = useMemo(
    () => cities.map((city: { id: number; codeName: string }) => ({ value: String(city.id), label: city.codeName || '' })),
    [cities]
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Profile Header Card with Avatar */}
      <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
              <span className="text-primary font-semibold text-2xl">
                {getInitials(instructor.name)}
              </span>
            </div>
          </div>

          {/* Name and Email Section */}
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              <FormInputField
                id="name"
                label={t('accountManagement.name')}
                placeholder={t('accountManagement.namePlaceholder')}
                register={register('name')}
                error={errors.name}
                required
                isSubmitting={isSubmitting}
              />
              <FormField id="email" label={t('accountManagement.email')}>
                <Input
                  id="email"
                  value={instructor.email || ''}
                  disabled
                  className="bg-muted"
                />
              </FormField>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Information Card */}
      <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2 inline-block">
              {t('profile.profileInformation')}
            </h3>
          </div>

          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phone Number */}
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

              {/* City */}
              <FormField id="city" label={t('accountManagement.city')} required>
                <Input
                  id="city"
                  placeholder={t('accountManagement.cityPlaceholder')}
                  value={instructor.cityId && cityMasterCodeMap[instructor.cityId] ? cityMasterCodeMap[instructor.cityId].codeName : ''}
                  disabled={isSubmitting}
                />
              </FormField>
              
              {/* Hidden cityId field */}
              <input
                type="hidden"
                {...register('cityId')}
                value={cityIdValue || (cityMasterCode?.items?.[0]?.id ? String(cityMasterCode.items[0].id) : '') || ''}
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

              {/* Interface Language */}
              <FormField
                id="interfaceLanguage"
                label={t('profile.interfaceLanguage')}
                required
                error={errors.interfaceLanguage}
              >
                <CustomDropdownField
                  id="interfaceLanguage"
                  value={interfaceLanguageValue || ''}
                  onChange={(value) => setValue('interfaceLanguage', value, { shouldValidate: true })}
                  placeholder={t('profile.selectLanguage')}
                  options={INTERFACE_LANGUAGES}
                  disabled={isSubmitting}
                  hasError={!!errors.interfaceLanguage}
                />
              </FormField>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
