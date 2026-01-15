import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { User, Lock, Mail, Phone, UserCircle, MapPin, Calendar as CalendarIcon, ChevronDownIcon } from 'lucide-react'
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
    resolver: zodResolver(createInstructorSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
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
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        dob: data.dob || undefined,
        regionId: data.regionId ? Number(data.regionId) : undefined,
        city: data.city || undefined,
        street: data.street || undefined,
        detailAddress: data.detailAddress || undefined,
        statusId: data.statusId ? Number(data.statusId) : undefined,
        classificationId: data.classificationId ? Number(data.classificationId) : undefined,
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
      title="Add New Instructor"
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_FULL, label: 'Instructors' }}
    >
      <div className="max-w-4xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
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
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                icon={<Lock className="h-4 w-4" />}
                {...register('password')}
                className={errors.password ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                icon={<UserCircle className="h-4 w-4" />}
                {...register('firstName')}
                className={errors.firstName ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                icon={<UserCircle className="h-4 w-4" />}
                {...register('lastName')}
                className={errors.lastName ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email (optional)"
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number (optional)"
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
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                type="text"
                placeholder="Enter gender (optional)"
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
              <Label htmlFor="dob">Date of Birth</Label>
              <Controller
                name="dob"
                control={control}
                rules={{ required: false }}
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
                              {date ? date.toLocaleDateString() : 'Enter date of birth (optional)'}
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
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Enter city (optional)"
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
                <Label htmlFor="zoneId">Zone</Label>
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
                          <SelectValue placeholder="Zone (auto-selected)">
                            {selectedZone ? selectedZone.name : 'Zone (auto-selected)'}
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
                <Label htmlFor="regionId">Region</Label>
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
                        <SelectValue placeholder="Select region" />
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
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                type="text"
                placeholder="Enter street (optional)"
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
              <Label htmlFor="detailAddress">Detail Address</Label>
              <Input
                id="detailAddress"
                type="text"
                placeholder="Enter detail address (optional)"
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
              <Label htmlFor="statusId">Status</Label>
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
                      <SelectValue placeholder="Select status (optional)" />
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
              <Label htmlFor="classificationId">Classification</Label>
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
                      <SelectValue placeholder="Select classification (optional)" />
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Instructor'}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
