import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock, Mail, Phone, UserCircle } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateAdmin } from '../../controller/mutations'
import { createAdminSchema, type CreateAdminFormData } from '../../model/account-management.schema'

export const AddAdminPage = () => {
  const navigate = useNavigate()
  const createAdminMutation = useCreateAdmin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
    },
  })

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createAdminMutation.mutateAsync({
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      })
      navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL)
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Failed to create admin:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL)
  }

  return (
    <PageLayout
      title="Add New Admin"
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL, label: 'Admins' }}
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

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter full name"
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
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
