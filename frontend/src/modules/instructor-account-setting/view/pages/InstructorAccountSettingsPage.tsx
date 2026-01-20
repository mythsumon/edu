import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { FormPasswordField } from '../components/FormPasswordField'
import { changePasswordSchema, type ChangePasswordFormData } from '../../model/instructor-account-setting.schema'
import { useChangePassword } from '../../controller/mutations'
import { useLogoutMutation } from '@/modules/auth/controller/mutations'

export const InstructorAccountSettingsPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const changePasswordMutation = useChangePassword()
  const logoutMutation = useLogoutMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema(t)),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          // Show success toast
          toast({
            title: t('common.success'),
            description: t('accountSettings.updateSuccess'),
            variant: 'success',
          })
          reset()
          
          // Logout after a short delay to ensure toast is visible
          setTimeout(() => {
            console.log('[InstructorAccountSettingsPage] Password changed successfully, logging out...')
            logoutMutation.mutate()
          }, 1500) // 1.5 second delay to show toast
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: string }).message)
                : t('accountSettings.updateError')

          toast({
            title: t('common.error'),
            description: errorMessage,
            variant: 'error',
          })
          console.error('Failed to update password:', error)
        },
      }
    )
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <PageLayout
      title={t('accountSettings.title')}
      actions={
        <Button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSubmitting || changePasswordMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting || changePasswordMutation.isPending
            ? t('accountSettings.updating')
            : t('accountSettings.updatePassword')}
        </Button>
      }
    >
      <ErrorBoundary>
        <div className="max-w-4xl mx-auto space-y-6 py-6">
          {/* Change Password Card */}
          <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2 inline-block">
                  {t('accountSettings.changePassword')}
                </h3>
              </div>

              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Old Password */}
                  <FormPasswordField
                    id="oldPassword"
                    label={t('accountSettings.oldPassword')}
                    placeholder={t('accountSettings.oldPasswordPlaceholder')}
                    register={register('oldPassword')}
                    error={errors.oldPassword}
                    required
                    isSubmitting={isSubmitting || changePasswordMutation.isPending}
                    autoComplete="current-password"
                  />

                  {/* New Password */}
                  <FormPasswordField
                    id="newPassword"
                    label={t('accountSettings.newPassword')}
                    placeholder={t('accountSettings.newPasswordPlaceholder')}
                    register={register('newPassword')}
                    error={errors.newPassword}
                    required
                    isSubmitting={isSubmitting || changePasswordMutation.isPending}
                    autoComplete="new-password"
                  />

                  {/* Confirm Password */}
                  <FormPasswordField
                    id="confirmPassword"
                    label={t('accountSettings.confirmPassword')}
                    placeholder={t('accountSettings.confirmPasswordPlaceholder')}
                    register={register('confirmPassword')}
                    error={errors.confirmPassword}
                    required
                    isSubmitting={isSubmitting || changePasswordMutation.isPending}
                    autoComplete="new-password"
                  />
                </div>
              </form>
            </div>
          </Card>
        </div>
      </ErrorBoundary>
    </PageLayout>
  )
}
