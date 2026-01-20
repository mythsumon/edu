import { useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/ui/card'
import { FormInputField } from './FormInputField'
import { FormField } from './FormField'
import { FormDatePickerField } from './FormDatePickerField'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/ui/use-toast'
import { updateInstructorProfileSchema, type UpdateInstructorProfileFormData } from '../../model/instructor-profile.schema'
import { GENDER_OPTIONS } from '@/shared/constants/users'
import type { MasterCodeResponseDto } from '../../model/instructor-profile.types'
import type { PageResponse } from '@/shared/http/types/common'
import { usePatchInstructorMe } from '../../controller/mutations'

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
  cities: Array<{ id: number; codeName: string }>
  districts: Array<{ id: number; codeName: string }>
  isLoadingCities: boolean
  onSuccess: () => void
  getInitials: (name: string) => string
  formRef?: React.RefObject<HTMLFormElement>
  onSubmittingChange?: (isSubmitting: boolean) => void
}

export const InstructorProfileEditView = ({
  instructor,
  cityMasterCode,
  cityMasterCodeMap,
  cities,
  districts,
  isLoadingCities,
  onSuccess,
  getInitials,
  formRef: externalFormRef,
  onSubmittingChange,
}: InstructorProfileEditViewProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const patchInstructorMutation = usePatchInstructorMe()
  const internalFormRef = useRef<HTMLFormElement>(null)
  const formRef = externalFormRef || internalFormRef

  // Suppress unused variable warning - cities may be used in future
  void cities

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
    },
  })

  const isSubmitting = patchInstructorMutation.isPending

  const genderValue = watch('gender')
  const selectedRegionId = watch('regionId')

  // Pre-fill form with instructor data
  useEffect(() => {
    if (districts.length > 0 || instructor.regionId) {
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
      })
    }
  }, [reset, instructor, districts.length, cityMasterCode])

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
  const onSubmit = (data: UpdateInstructorProfileFormData) => {
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

    // Call mutation with callbacks
    patchInstructorMutation.mutate(requestData, {
      onSuccess: () => {
        // Show success message
        toast({
          title: t('common.success'),
          description: t('profile.updateSuccess'),
          variant: 'success',
        })

        // Call success callback to close edit mode
        onSuccess()
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: string }).message)
              : t('profile.updateError')

        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'error',
        })
        console.error('Failed to update profile:', error)
      },
    })
  }

  // Transform options to DropdownOption format
  const genderOptions: DropdownOption[] = useMemo(
    () => GENDER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
    []
  )

  const regionOptions: DropdownOption[] = useMemo(
    () => districts.map((region: { id: number; codeName: string }) => ({ value: String(region.id), label: region.codeName || '' })),
    [districts]
  )

  // Get city name for display
  const cityName = useMemo(() => {
    if (instructor.cityId && cityMasterCodeMap[instructor.cityId]) {
      return cityMasterCodeMap[instructor.cityId].codeName
    }
    return ''
  }, [instructor.cityId, cityMasterCodeMap])

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
                  disabled={isSubmitting || isLoadingCities}
                  hasError={!!errors.regionId}
                />
              </FormField>

              {/* City - Disabled field showing city name */}
              <FormField id="city" label={t('accountManagement.city')} error={errors.cityId}>
                <Input
                  id="city"
                  placeholder={t('accountManagement.cityPlaceholder')}
                  value={cityName}
                  disabled
                  readOnly
                  className={errors.cityId ? 'ring-2 ring-destructive' : ''}
                />
              </FormField>
              
              {/* Hidden cityId field to ensure it's submitted */}
              <input
                type="hidden"
                {...register('cityId')}
                value={instructor.cityId ? String(instructor.cityId) : ''}
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
          </form>
        </div>
      </Card>
    </div>
  )
}
