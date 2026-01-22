import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useRef, useMemo } from 'react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { useCreateTeacher } from '../../controller/mutations'
import { createTeacherSchema, type CreateTeacherFormData } from '../../model/account-management.schema'
import { useMasterCodeChildrenByCodeQuery } from '@/modules/master-code-setup/controller/queries'
import { MASTER_CODE_PARENT_CODES } from '@/shared/constants/master-code'
import { FormInputField } from '../components/FormInputField'
import { FormPasswordField } from '../components/FormPasswordField'
import { FormField } from '../components/FormField'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { CollapsibleCard } from '../components/CollapsibleCard'

export const AddTeacherPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const createTeacherMutation = useCreateTeacher()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeacherFormData>({
    resolver: zodResolver(createTeacherSchema(t)),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: 'teacher123',
      name: '',
      email: '',
      phone: '',
      statusId: '',
    },
  })

  const statusIdValue = watch('statusId')

  // Fetch status master codes (parent code 100)
  const { data: statusMasterCodesData, isLoading: isLoadingStatusCodes } = useMasterCodeChildrenByCodeQuery(
    MASTER_CODE_PARENT_CODES.STATUS
  )
  const statusMasterCodes = statusMasterCodesData?.items || []

  const statusOptions: DropdownOption[] = useMemo(
    () => statusMasterCodes.map((status) => ({ value: String(status.id), label: status.codeName || '' })),
    [statusMasterCodes]
  )

  const onSubmit = async (data: CreateTeacherFormData) => {
    try {
      await createTeacherMutation.mutateAsync({
        username: data.username,
        password: data.password,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        statusId: data.statusId ? parseInt(data.statusId, 10) : undefined,
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.createTeacherSuccess'),
        variant: 'success',
      })
      navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL)
    } catch (error) {
      // Extract error message from the error object
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountManagement.createTeacherError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to create teacher:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return (
    <PageLayout
      title={t('accountManagement.addNewTeacher')}
      customBreadcrumbRoot={{ path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL, label: t('accountManagement.teachers') }}
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
            {isSubmitting ? t('accountManagement.creating') : t('accountManagement.createTeacher')}
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
              {/* Teacher ID / Username */}
              <FormInputField
                id="username"
                label={t('accountManagement.username')}
                placeholder={t('accountManagement.usernamePlaceholder')}
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
                placeholder={t('accountManagement.phoneNumberPlaceholder')}
                type="tel"
                register={register('phone')}
                error={errors.phone}
                isSubmitting={isSubmitting}
              />

              {/* Status */}
              <FormField id="statusId" label={t('accountManagement.status')} required error={errors.statusId}>
                <CustomDropdownField
                  id="statusId"
                  value={statusIdValue || ''}
                  onChange={(value) => setValue('statusId', value, { shouldValidate: true })}
                  placeholder={t('accountManagement.statusPlaceholder')}
                  options={statusOptions}
                  disabled={isSubmitting || isLoadingStatusCodes}
                  hasError={!!errors.statusId}
                />
              </FormField>
            </div>
          </CollapsibleCard>
        </form>
      </div>
    </PageLayout>
  )
}
