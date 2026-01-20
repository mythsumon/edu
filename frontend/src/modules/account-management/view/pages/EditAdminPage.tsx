import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { useUpdateAdminByUsername } from '../../controller/mutations'
import { useAdminDetailByUsernameQuery } from '../../controller/queries'
import { updateAdminSchema, type UpdateAdminFormData } from '../../model/account-management.schema'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { FormInputField } from '../components/FormInputField'
import { CollapsibleCard } from '../components/CollapsibleCard'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export const EditAdminPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const adminUsername = username || ''
  const updateAdminMutation = useUpdateAdminByUsername()
  const formRef = useRef<HTMLFormElement>(null)

  const { data: admin, isLoading: isLoadingAdmin, error: adminError } = useAdminDetailByUsernameQuery(adminUsername)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  // Pre-fill form with admin data using reset() to properly initialize and clear validation errors
  useEffect(() => {
    if (admin) {
      reset({
        name: admin.name,
        email: admin.email || '',
        phone: admin.phone || '',
      })
    }
  }, [admin, reset])

  const onSubmit = async (data: UpdateAdminFormData) => {
    try {
      await updateAdminMutation.mutateAsync({
        username: adminUsername,
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
        },
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.updateAdminSuccess'),
        variant: 'success',
      })
      navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL}/${encodeURIComponent(adminUsername)}`)
    } catch (error) {
      // Extract error message from the error object
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountManagement.updateAdminError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update admin:', error)
    }
  }

  const handleCancel = () => {
    navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL}/${encodeURIComponent(adminUsername)}`)
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
      title={t('accountManagement.editAdmin')}
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL, label: t('accountManagement.admins') }}
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
            {isSubmitting ? t('accountManagement.updating') : t('accountManagement.updateAdmin')}
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
              {/* Admin ID / Username (Read-only) */}
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

              {/* Name */}
              <FormInputField
                id="name"
                label={t('accountManagement.name')}
                placeholder={t('accountManagement.namePlaceholder')}
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
                type="email"
                register={register('email')}
                error={errors.email}
                required
                isSubmitting={isSubmitting}
              />

              {/* Phone */}
              <FormInputField
                id="phone"
                label={t('accountManagement.phoneNumber')}
                placeholder={t('accountManagement.phoneNumberPlaceholder')}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                isSubmitting={isSubmitting}
              />
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
