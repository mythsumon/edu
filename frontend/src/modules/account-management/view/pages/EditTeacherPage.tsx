import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef } from 'react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/use-toast'
import { ROUTES } from '@/shared/constants/routes'
import { useUpdateTeacher } from '../../controller/mutations'
import { useTeacherDetailQuery } from '../../controller/queries'
import { updateTeacherSchema, type UpdateTeacherFormData } from '../../model/account-management.schema'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { FormInputField } from '../components/FormInputField'
import { CollapsibleCard } from '../components/CollapsibleCard'

export const EditTeacherPage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const teacherId = id ? parseInt(id, 10) : 0
  const updateTeacherMutation = useUpdateTeacher()
  const formRef = useRef<HTMLFormElement>(null)

  const { data: teacher, isLoading: isLoadingTeacher, error: teacherError } = useTeacherDetailQuery(teacherId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeacherFormData>({
    resolver: zodResolver(updateTeacherSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  // Pre-fill form with teacher data using reset() to properly initialize and clear validation errors
  useEffect(() => {
    if (teacher) {
      reset({
        name: teacher.name,
        email: teacher.email || '',
        phone: teacher.phone || '',
      })
    }
  }, [teacher, reset])

  const onSubmit = async (data: UpdateTeacherFormData) => {
    try {
      await updateTeacherMutation.mutateAsync({
        id: teacherId,
        data: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
        },
      })
      toast({
        title: t('common.success'),
        description: t('accountManagement.updateTeacherSuccess'),
        variant: 'success',
      })
      navigate(`${ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_FULL}/${teacherId}`)
    } catch (error) {
      // Extract error message from the error object
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('accountManagement.updateTeacherError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update teacher:', error)
    }
  }

  const handleCancel = () => {
    navigate(ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_DETAIL_FULL.replace(':id', String(teacherId)))
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  if (isLoadingTeacher) {
    return <LoadingState />
  }

  if (teacherError || !teacher) {
    return <ErrorState error={teacherError || undefined} />
  }

  return (
    <PageLayout
      title={t('accountManagement.editTeacher')}
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
            {isSubmitting ? t('accountManagement.updating') : t('accountManagement.updateTeacher')}
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
