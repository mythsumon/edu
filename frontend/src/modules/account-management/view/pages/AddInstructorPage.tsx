import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, Mail, Phone, UserCircle, MapPin, Calendar } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateInstructor } from '../../controller/mutations'
import { createInstructorSchema, type CreateInstructorFormData } from '../../model/account-management.schema'

export const AddInstructorPage = () => {
  const navigate = useNavigate()
  const createInstructorMutation = useCreateInstructor()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateInstructorFormData>({
    resolver: zodResolver(createInstructorSchema),
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      regionId: '',
      city: '',
      street: '',
      detailAddress: '',
      statusId: '',
      classificationId: '',
    },
  })

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
      <div className="max-w-4xl p-6 mx-auto">
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
              <Input
                id="dob"
                type="date"
                placeholder="Enter date of birth (optional)"
                icon={<Calendar className="h-4 w-4" />}
                {...register('dob')}
                className={errors.dob ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.dob && (
                <p className="text-sm text-destructive">{errors.dob.message}</p>
              )}
            </div>

            {/* Region ID */}
            <div className="space-y-2">
              <Label htmlFor="regionId">Region ID</Label>
              <Input
                id="regionId"
                type="number"
                placeholder="Enter region ID (optional)"
                icon={<MapPin className="h-4 w-4" />}
                {...register('regionId')}
                className={errors.regionId ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.regionId && (
                <p className="text-sm text-destructive">{errors.regionId.message}</p>
              )}
            </div>

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

            {/* Status ID */}
            <div className="space-y-2">
              <Label htmlFor="statusId">Status ID</Label>
              <Input
                id="statusId"
                type="number"
                placeholder="Enter status ID (optional)"
                icon={<UserCircle className="h-4 w-4" />}
                {...register('statusId')}
                className={errors.statusId ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.statusId && (
                <p className="text-sm text-destructive">{errors.statusId.message}</p>
              )}
            </div>

            {/* Classification ID */}
            <div className="space-y-2">
              <Label htmlFor="classificationId">Classification ID</Label>
              <Input
                id="classificationId"
                type="number"
                placeholder="Enter classification ID (optional)"
                icon={<UserCircle className="h-4 w-4" />}
                {...register('classificationId')}
                className={errors.classificationId ? 'ring-2 ring-destructive' : ''}
                disabled={isSubmitting}
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
