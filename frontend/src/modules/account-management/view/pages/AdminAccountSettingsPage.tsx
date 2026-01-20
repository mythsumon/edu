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
import { useChangePassword } from '../../controller/mutations'
import { changePasswordSchema, type ChangePasswordFormData } from '../../model/account-management.schema'
import { FormPasswordField } from '../components/FormPasswordField'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'

export const AdminAccountSettingsPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const changePasswordMutation = useChangePassword()
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

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        loadUser()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema(t)),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Determine navigation path based on role
  const getBackPath = () => {
    if (!user?.roleName) return ROUTES.ADMIN_DASHBOARD_FULL
    const role = user.roleName.toUpperCase()
    if (role === 'ADMIN') return ROUTES.ADMIN_DASHBOARD_FULL
    if (role === 'INSTRUCTOR') return ROUTES.INSTRUCTOR_DASHBOARD_FULL
    return ROUTES.ADMIN_DASHBOARD_FULL
  }

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.changePasswordSuccess'),
        variant: 'success',
      })
      reset()
    } catch (error) {
      // Extract error message from various error formats
      let errorMessage = t('accountManagement.changePasswordError')
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      } else if (error && typeof error === 'object') {
        // Handle AxiosError or ApiError structure
        if ('response' in error && error.response && typeof error.response === 'object') {
          const responseData = (error.response as any).data
          if (responseData && typeof responseData === 'object' && 'message' in responseData) {
            errorMessage = String(responseData.message) || errorMessage
          }
        } else if ('message' in error) {
          errorMessage = String(error.message) || errorMessage
        }
      }

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to change password:', error)
    }
  }

  const handleCancel = () => {
    navigate(getBackPath())
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <PageLayout
      title={t('accountManagement.accountSettings')}
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
            disabled={isSubmitting || changePasswordMutation.isPending}
          >
            {isSubmitting || changePasswordMutation.isPending
              ? t('accountManagement.changingPassword')
              : t('accountManagement.changePassword')}
          </Button>
        </>
      }
    >
      <div className="max-w-4xl p-6 mx-auto">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CollapsibleCard
            title={t('accountManagement.accountInformation')}
            description={t('accountManagement.accountInformationDescription')}
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
                  value={user?.username || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title={t('accountManagement.changePassword')}
            description={t('accountManagement.changePasswordDescription')}
            defaultExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <FormPasswordField
                  id="currentPassword"
                  label={t('accountManagement.currentPassword')}
                  placeholder={t('accountManagement.currentPasswordPlaceholder')}
                  register={register('currentPassword')}
                  error={errors.currentPassword}
                  required
                  isSubmitting={isSubmitting || changePasswordMutation.isPending}
                />
              </div>

              <FormPasswordField
                id="newPassword"
                label={t('accountManagement.newPassword')}
                placeholder={t('accountManagement.newPasswordPlaceholder')}
                register={register('newPassword')}
                error={errors.newPassword}
                required
                isSubmitting={isSubmitting || changePasswordMutation.isPending}
              />

              <FormPasswordField
                id="confirmPassword"
                label={t('accountManagement.confirmPassword')}
                placeholder={t('accountManagement.confirmPasswordPlaceholder')}
                register={register('confirmPassword')}
                error={errors.confirmPassword}
                required
                isSubmitting={isSubmitting || changePasswordMutation.isPending}
              />
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
