import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import { useUpdateOwnProfile } from '../../controller/mutations'
import { useAdminDetailByUsernameQuery } from '../../controller/queries'
import { updateOwnProfileAdminSchema, type UpdateOwnProfileAdminFormData } from '../../model/account-management.schema'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { FormInputField } from '../components/FormInputField'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { getCurrentUser } from '@/modules/auth/model/auth.service'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

export const ProfileSettingsAdminPage = () => {
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
  const { data: admin, isLoading: isLoadingAdmin, error: adminError } = useAdminDetailByUsernameQuery(
    username,
    { enabled: !!username }
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateOwnProfileAdminFormData>({
    resolver: zodResolver(updateOwnProfileAdminSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  // Pre-fill form with admin data
  useEffect(() => {
    if (admin) {
      reset({
        name: admin.name,
        email: admin.email || '',
        phone: admin.phone || '',
      })
    }
  }, [admin, reset])

  const onSubmit = async (data: UpdateOwnProfileAdminFormData) => {
    if (!user || !username) return

    try {
      await updateProfileMutation.mutateAsync({
        username,
        roleName: user.roleName,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
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
    navigate(ROUTES.ADMIN_DASHBOARD_FULL)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  if (isLoadingAdmin) {
    return <LoadingState />
  }

  if (adminError || !admin) {
    return <ErrorState error={adminError || undefined} />
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
                <Label htmlFor="username">
                  {t('accountManagement.username')}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={admin.username}
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
                placeholder={t('accountManagement.phoneNumberPlaceholder')}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                isSubmitting={isSubmitting || updateProfileMutation.isPending}
              />
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
