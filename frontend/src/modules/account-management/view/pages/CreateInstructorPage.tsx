import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { User, Mail, Phone, UserCircle, MapPin } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateInstructor } from '../../controller/mutations'
import { createInstructorSchema, type CreateInstructorFormData } from '../../model/account-management.schema'
import { useZonesQuery, useRegionsQuery } from '../../controller/zone-region.queries'
import { useMasterCodeChildrenByCodeQuery } from '@/modules/master-code-setup/controller/queries'
import { MASTER_CODE_PARENT_CODES } from '@/shared/constants/master-code'
import { FormInputField } from '../components/FormInputField'
import { FormPasswordField } from '../components/FormPasswordField'
import { FormSelectField } from '../components/FormSelectField'
import { FormDatePickerField } from '../components/FormDatePickerField'
import { CollapsibleCard } from '../components/CollapsibleCard'

export const AddInstructorPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createInstructorMutation = useCreateInstructor()
  const { data: zones = [] } = useZonesQuery()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstructorFormData>({
    resolver: zodResolver(createInstructorSchema(t)),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: 'instructor123',
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
    },
  })

  const { data: regions = [], isLoading: isLoadingRegions } = useRegionsQuery()
  const selectedRegionId = watch('regionId')

  // Fetch status master codes (parent code 100)
  const { data: statusMasterCodesData, isLoading: isLoadingStatusCodes } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  )
  const statusMasterCodes = statusMasterCodesData?.items || []

  // Fetch classification master codes (parent code 200)
  const { data: classificationMasterCodesData, isLoading: isLoadingClassificationCodes } =
    useMasterCodeChildrenByCodeQuery(MASTER_CODE_PARENT_CODES.INSTRUCTOR_CLASSIFICATION)
  const classificationMasterCodes = classificationMasterCodesData?.items || []

  // Auto-select zone when region is selected
  useEffect(() => {
    if (selectedRegionId) {
      const selectedRegion = regions.find((r) => String(r.id) === selectedRegionId)
      if (selectedRegion && selectedRegion.zoneId) {
        setValue('zoneId', String(selectedRegion.zoneId))
      }
    } else {
      // Clear zone when region is cleared
      setValue('zoneId', '')
    }
  }, [selectedRegionId, regions, setValue])

  const onSubmit = async (data: CreateInstructorFormData) => {
    try {
      await createInstructorMutation.mutateAsync({
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        regionId: Number(data.regionId),
        city: data.city,
        street: data.street,
        detailAddress: data.detailAddress,
        statusId: Number(data.statusId),
        classificationId: Number(data.classificationId),
      })
      navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL)
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Failed to create instructor:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <PageLayout
      title={t('accountManagement.addNewInstructor')}
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
            {isSubmitting ? t('accountManagement.creating') : t('accountManagement.createInstructor')}
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
                icon={<User className="h-4 w-4" />}
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
                icon={<UserCircle className="h-4 w-4" />}
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
                icon={<Mail className="h-4 w-4" />}
                type="email"
                register={register('email')}
                error={errors.email}
                isSubmitting={isSubmitting}
              />

              {/* Password */}
              <FormPasswordField
                id="password"
                label={t('accountManagement.password')}
                placeholder={t('accountManagement.passwordPlaceholder')}
                register={register('password')}
                error={errors.password}
                required
                isSubmitting={isSubmitting}
              />

              {/* Phone */}
              <FormInputField
                id="phone"
                label={t('accountManagement.phoneNumber')}
                placeholder={t('accountManagement.phoneNumberRequiredPlaceholder')}
                icon={<Phone className="h-4 w-4" />}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                required
                isSubmitting={isSubmitting}
              />

              {/* Gender */}
              <FormInputField
                id="gender"
                label={t('accountManagement.gender')}
                placeholder={t('accountManagement.genderPlaceholder')}
                icon={<UserCircle className="h-4 w-4" />}
                register={register('gender')}
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

          {/* Address Information Collapsible Card */}
          <CollapsibleCard
            title={t('accountManagement.addressInformation')}
            description={t('accountManagement.addressInformationDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* City, Zone, Region - One row on lg+ screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 col-span-1 lg:col-span-2">
                {/* City */}
                <FormInputField
                  id="city"
                  label={t('accountManagement.city')}
                  placeholder={t('accountManagement.cityPlaceholder')}
                  icon={<MapPin className="h-4 w-4" />}
                  register={register('city')}
                  error={errors.city}
                  required
                  isSubmitting={isSubmitting}
                />

                {/* Zone */}
                <FormSelectField
                  id="zoneId"
                  name="zoneId"
                  label={t('accountManagement.zone')}
                  placeholder={t('accountManagement.zoneAutoSelected')}
                  icon={<MapPin className="h-4 w-4" />}
                  control={control}
                  options={zones}
                  getOptionValue={(option) => String(option.id)}
                  getOptionLabel={(option) => option.name || ''}
                  error={errors.zoneId}
                  required
                  isSubmitting={isSubmitting}
                  disabled
                  onValueChange={() => { }} // Disabled - auto-selected
                  displayValue={(value) => {
                    const selectedZone = value ? zones.find((z) => String(z.id) === value) : null
                    return selectedZone ? selectedZone.name : t('accountManagement.zoneAutoSelected')
                  }}
                />

                {/* Region */}
                <FormSelectField
                  id="regionId"
                  name="regionId"
                  label={t('accountManagement.region')}
                  placeholder={t('accountManagement.regionPlaceholder')}
                  icon={<MapPin className="h-4 w-4" />}
                  control={control}
                  options={regions}
                  getOptionValue={(option) => String(option.id)}
                  getOptionLabel={(option) => option.name || ''}
                  error={errors.regionId}
                  required
                  isSubmitting={isSubmitting}
                  isLoading={isLoadingRegions}
                />
              </div>

              {/* Street */}
              <FormInputField
                id="street"
                label={t('accountManagement.street')}
                placeholder={t('accountManagement.streetPlaceholder')}
                icon={<MapPin className="h-4 w-4" />}
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
                icon={<MapPin className="h-4 w-4" />}
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
                icon={<UserCircle className="h-4 w-4" />}
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
                icon={<UserCircle className="h-4 w-4" />}
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
