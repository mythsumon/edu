import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { FormPasswordField } from '../components/FormPasswordField'
import { changePasswordSchema, type ChangePasswordFormData } from '../../model/change-password.schema'

export const InstructorAccountSettingsPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

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

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      // TODO: Implement actual API call when backend is ready
      // await changePasswordMutation.mutateAsync({
      //   oldPassword: data.oldPassword,
      //   newPassword: data.newPassword,
      // })
      // Using data to avoid linting error - will be used when API is implemented
      void data

      toast({
        title: t('common.success'),
        description: t('accountSettings.updateSuccess'),
        variant: 'success',
      })
      reset()
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountSettings.updateError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update password:', error)
    }
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
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? t('accountSettings.updating') : t('accountSettings.updatePassword')}
        </Button>
      }
    >
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
                  isSubmitting={isSubmitting}
                  autoComplete="new-password"
                />

                {/* New Password */}
                <FormPasswordField
                  id="newPassword"
                  label={t('accountSettings.newPassword')}
                  placeholder={t('accountSettings.newPasswordPlaceholder')}
                  register={register('newPassword')}
                  error={errors.newPassword}
                  required
                  isSubmitting={isSubmitting}
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
                  isSubmitting={isSubmitting}
                  autoComplete="new-password"
                />
              </div>
            </form>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
