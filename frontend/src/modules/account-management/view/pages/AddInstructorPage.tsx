import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { User, Lock, Mail, Phone, UserCircle, MapPin, Calendar as CalendarIcon, ChevronDownIcon, Eye, EyeOff } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Calendar } from '@/shared/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateInstructor } from '../../controller/mutations'
import { createInstructorSchema, type CreateInstructorFormData } from '../../model/account-management.schema'
import { useZonesQuery, useRegionsQuery } from '../../controller/zone-region.queries'
import { useMasterCodeChildrenByCodeQuery } from '@/modules/master-code-setup/controller/queries'
import { MASTER_CODE_PARENT_CODES } from '@/shared/constants/master-code'

export const AddInstructorPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createInstructorMutation = useCreateInstructor()
  const { data: zones = [] } = useZonesQuery()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstructorFormData>({
    resolver: zodResolver(createInstructorSchema(t)),
    mode: 'onBlur',
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
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
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

  return (
    <PageLayout
      title={t('accountManagement.addNewInstructor')}
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL, label: t('accountManagement.instructors') }}
    >
      <div className="max-w-4xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                {t('accountManagement.username')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t('accountManagement.usernamePlaceholder')}
                icon={<User className="h-4 w-4" />}
                {...register('username')}
                className={errors.username ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {t('accountManagement.password')} <span className="text-destructive">**</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('accountManagement.passwordPlaceholder')}
                  icon={<Lock className="h-4 w-4" />}
                  {...register('password')}
                  className={errors.password ? 'ring-2 ring-destructive pr-10' : 'pr-10'}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                  aria-label={showPassword ? t('accountManagement.hidePassword') : t('accountManagement.showPassword')}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('accountManagement.name')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('accountManagement.namePlaceholder')}
                icon={<UserCircle className="h-4 w-4" />}
                {...register('name')}
                className={errors.name ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('accountManagement.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('accountManagement.emailPlaceholder')}
                icon={<Mail className="h-4 w-4" />}
                {...register('email')}
                className={errors.email ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('accountManagement.phoneNumber')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('accountManagement.phoneNumberRequiredPlaceholder')}
                icon={<Phone className="h-4 w-4" />}
                {...register('phone')}
                className={errors.phone ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">
                {t('accountManagement.gender')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="gender"
                type="text"
                placeholder={t('accountManagement.genderPlaceholder')}
                icon={<UserCircle className="h-4 w-4" />}
                {...register('gender')}
                className={errors.gender ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob">
                {t('accountManagement.dateOfBirth')} <span className="text-destructive">**</span>
              </Label>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => {
                  let date: Date | undefined
                  try {
                    date = field.value && field.value.trim() !== '' ? new Date(field.value) : undefined
                    // Check if date is valid
                    if (date && isNaN(date.getTime())) {
                      date = undefined
                    }
                  } catch {
                    date = undefined
                  }

                  return (
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative w-full">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            id="dob"
                            className={`h-12 w-full rounded-lg border-0 bg-secondary px-3 py-2 pl-10 pr-3 text-sm text-left justify-between font-normal hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out ${errors.dob ? 'ring-2 ring-destructive' : ''} ${!date ? 'text-muted-foreground/60' : ''}`}
                            disabled={isSubmitting}
                            onBlur={field.onBlur}
                          >
                            <span className="flex-1 text-left">
                              {date ? date.toLocaleDateString() : t('accountManagement.dateOfBirthPlaceholder')}
                            </span>
                            <ChevronDownIcon className="h-4 w-4 shrink-0 ml-2" />
                          </Button>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          captionLayout="dropdown"
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              // Convert Date to YYYY-MM-DD string format
                              const year = selectedDate.getFullYear()
                              const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                              const day = String(selectedDate.getDate()).padStart(2, '0')
                              field.onChange(`${year}-${month}-${day}`, { shouldValidate: false })
                            } else {
                              field.onChange('', { shouldValidate: false })
                            }
                            setDatePickerOpen(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
              {errors.dob && (
                <p className="text-sm text-destructive">{errors.dob.message}</p>
              )}
            </div>

            {/* City, Zone, Region - One row on lg+ screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 col-span-1 lg:col-span-2">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">
                  {t('accountManagement.city')} <span className="text-destructive">**</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder={t('accountManagement.cityPlaceholder')}
                  icon={<MapPin className="h-4 w-4" />}
                  {...register('city')}
                  className={errors.city ? 'ring-2 ring-destructive' : ''}
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              {/* Zone */}
              <div className="space-y-2">
                <Label htmlFor="zoneId">
                  {t('accountManagement.zone')} <span className="text-destructive">**</span>
                </Label>
                <Controller
                  name="zoneId"
                  control={control}
                  render={({ field }) => {
                    const selectedZone = field.value
                      ? zones.find((z) => String(z.id) === field.value)
                      : null

                    return (
                      <Select
                        value={field.value || undefined}
                        onValueChange={() => {}} // Disabled - auto-selected
                        disabled={true}
                      >
                        <SelectTrigger
                          icon={<MapPin className="h-4 w-4" />}
                          className={`${errors.zoneId ? 'ring-2 ring-destructive' : ''} ${!field.value ? 'text-muted-foreground/60' : ''}`}
                        >
                          <SelectValue placeholder={t('accountManagement.zoneAutoSelected')}>
                            {selectedZone ? selectedZone.name : t('accountManagement.zoneAutoSelected')}
                          </SelectValue>
                        </SelectTrigger>
                      </Select>
                    )
                  }}
                />
                {errors.zoneId && (
                  <p className="text-sm text-destructive">{errors.zoneId.message}</p>
                )}
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="regionId">
                  {t('accountManagement.region')} <span className="text-destructive">**</span>
                </Label>
                <Controller
                  name="regionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value || '')}
                      disabled={isSubmitting || isLoadingRegions}
                    >
                      <SelectTrigger
                        icon={<MapPin className="h-4 w-4" />}
                        className={`${errors.regionId ? 'ring-2 ring-destructive' : ''} ${!field.value ? 'text-muted-foreground/60' : ''}`}
                      >
                        <SelectValue placeholder={t('accountManagement.regionPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={String(region.id)}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.regionId && (
                  <p className="text-sm text-destructive">{errors.regionId.message}</p>
                )}
              </div>
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">
                {t('accountManagement.street')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="street"
                type="text"
                placeholder={t('accountManagement.streetPlaceholder')}
                icon={<MapPin className="h-4 w-4" />}
                {...register('street')}
                className={errors.street ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.street && (
                <p className="text-sm text-destructive">{errors.street.message}</p>
              )}
            </div>

            {/* Detail Address */}
            <div className="space-y-2">
              <Label htmlFor="detailAddress">
                {t('accountManagement.buildingNameLakeNumber')} <span className="text-destructive">**</span>
              </Label>
              <Input
                id="detailAddress"
                type="text"
                placeholder={t('accountManagement.buildingNameLakeNumberPlaceholder')}
                icon={<MapPin className="h-4 w-4" />}
                {...register('detailAddress')}
                className={errors.detailAddress ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.detailAddress && (
                <p className="text-sm text-destructive">{errors.detailAddress.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="statusId">
                {t('accountManagement.status')} <span className="text-destructive">**</span>
              </Label>
              <Controller
                name="statusId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value || '')}
                    disabled={isSubmitting || isLoadingStatusCodes}
                  >
                    <SelectTrigger
                      icon={<UserCircle className="h-4 w-4" />}
                      className={`${errors.statusId ? 'ring-2 ring-destructive' : ''} ${!field.value ? 'text-muted-foreground/60' : ''}`}
                    >
                      <SelectValue placeholder={t('accountManagement.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusMasterCodes.map((status) => (
                        <SelectItem key={status.id} value={String(status.id)}>
                          {status.codeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.statusId && (
                <p className="text-sm text-destructive">{errors.statusId.message}</p>
              )}
            </div>

            {/* Classification */}
            <div className="space-y-2">
              <Label htmlFor="classificationId">
                {t('accountManagement.classification')} <span className="text-destructive">**</span>
              </Label>
              <Controller
                name="classificationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value || '')}
                    disabled={isSubmitting || isLoadingClassificationCodes}
                  >
                    <SelectTrigger
                      icon={<UserCircle className="h-4 w-4" />}
                      className={`${errors.classificationId ? 'ring-2 ring-destructive' : ''} ${!field.value ? 'text-muted-foreground/60' : ''}`}
                    >
                      <SelectValue placeholder={t('accountManagement.classificationPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationMasterCodes.map((classification) => (
                        <SelectItem key={classification.id} value={String(classification.id)}>
                          {classification.codeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classificationId && (
                <p className="text-sm text-destructive">{errors.classificationId.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('accountManagement.creating') : t('accountManagement.createInstructor')}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
