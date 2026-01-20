import { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Edit, Save, X } from 'lucide-react'
import { PageLayout } from '@/app/layout/PageLayout'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { FormInputField } from '@/modules/account-management/view/components/FormInputField'
import { FormField } from '@/modules/account-management/view/components/FormField'
import { CustomDropdownField, type DropdownOption } from '@/shared/components/CustomDropdown'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { updateInstructorProfileSchema, type UpdateInstructorProfileFormData } from '../../model/instructor-profile.schema'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { UserResponseDto } from '@/modules/auth/model/auth.types'
import { useUiStore } from '@/shared/stores/ui.store'
import i18n from '@/app/config/i18n'

const INTERFACE_LANGUAGES: DropdownOption[] = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
]

export const InstructorProfilePage = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { language, setLanguage } = useUiStore()
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserResponseDto | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Get current user from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)
      if (userStr) {
        const user: UserResponseDto = JSON.parse(userStr)
        setCurrentUser(user)
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error)
    }
  }, [])

  // Static instructor data from user object
  const instructor = useMemo(() => {
    if (currentUser?.instructor) {
      return {
        id: currentUser.id,
        name: currentUser.instructor.name || currentUser.username || 'Instructor',
        email: currentUser.instructor.email || '',
        phone: currentUser.instructor.phone || '',
        profilePhoto: undefined,
        signature: undefined,
      }
    }
    return {
      id: currentUser?.id || 0,
      name: currentUser?.username || 'Instructor',
      email: '',
      phone: '',
      profilePhoto: undefined,
      signature: undefined,
    }
  }, [currentUser])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateInstructorProfileFormData>({
    resolver: zodResolver(updateInstructorProfileSchema(t)),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      interfaceLanguage: language || 'ko',
    },
  })

  const interfaceLanguageValue = watch('interfaceLanguage')

  // Pre-fill form with instructor data when user loads
  useEffect(() => {
    if (currentUser && !isEditMode) {
      reset({
        name: instructor.name || '',
        phone: instructor.phone || '',
        interfaceLanguage: language || 'ko',
      })
    }
  }, [currentUser, language, reset, isEditMode, instructor])

  const onSubmit = async (data: UpdateInstructorProfileFormData) => {
    try {
      // Update interface language
      if (data.interfaceLanguage !== language) {
        setLanguage(data.interfaceLanguage as 'en' | 'ko')
        i18n.changeLanguage(data.interfaceLanguage)
      }

      // For static page, just show success message
      // TODO: Implement actual API call when backend is ready
      toast({
        title: t('common.success'),
        description: t('profile.updateSuccess'),
        variant: 'success',
      })
      setIsEditMode(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : t('profile.updateError')

      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'error',
      })
      console.error('Failed to update profile:', error)
    }
  }


  const handleCancel = () => {
    reset({
      name: instructor.name || '',
      phone: instructor.phone || '',
      interfaceLanguage: language || 'ko',
    })
    setIsEditMode(false)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <PageLayout
      title={t('profile.title')}
      actions={
        <>
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleFormSubmit}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}
        </>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Profile Header Card with Avatar */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                <span className="text-primary font-semibold text-2xl">
                  {getInitials(instructor.name)}
                </span>
              </div>
            </div>

            {/* Name and Email Section */}
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <div className="space-y-4">
                  <FormInputField
                    id="name"
                    label={t('accountManagement.name')}
                    placeholder={t('accountManagement.namePlaceholder')}
                    register={register('name')}
                    error={errors.name}
                    required
                    isSubmitting={isSubmitting}
                  />
                  <FormField id="email" label={t('accountManagement.email')}>
                    <Input
                      id="email"
                      value={instructor.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </FormField>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {instructor.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {instructor.email || '-'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Information Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground border-b-2 border-primary pb-2 inline-block">
                {t('profile.profileInformation')}
              </h3>
            </div>

            {isEditMode ? (
              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <FormInputField
                    id="phone"
                    label={t('accountManagement.phoneNumber')}
                    placeholder={t('accountManagement.phoneNumberRequiredPlaceholder')}
                    type="tel"
                    register={register('phone')}
                    error={errors.phone}
                    required
                    isSubmitting={isSubmitting}
                  />

                  {/* Interface Language */}
                  <FormField
                    id="interfaceLanguage"
                    label={t('profile.interfaceLanguage')}
                    required
                    error={errors.interfaceLanguage}
                  >
                    <CustomDropdownField
                      id="interfaceLanguage"
                      value={interfaceLanguageValue || ''}
                      onChange={(value) => setValue('interfaceLanguage', value, { shouldValidate: true })}
                      placeholder={t('profile.selectLanguage')}
                      options={INTERFACE_LANGUAGES}
                      disabled={isSubmitting}
                      hasError={!!errors.interfaceLanguage}
                    />
                  </FormField>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phone Number */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('accountManagement.phoneNumber')}
                  </Label>
                  <p className="mt-1 text-sm text-foreground">
                    {instructor.phone || '-'}
                  </p>
                </div>

                {/* Interface Language */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('profile.interfaceLanguage')}
                  </Label>
                  <p className="mt-1 text-sm text-foreground">
                    {INTERFACE_LANGUAGES.find((lang) => lang.value === language)?.label || language}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Signature Image Card */}
        <Card className="rounded-2xl border border-border/20 bg-card shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {t('profile.signatureImage')}
              </Label>
              {instructor.signature ? (
                <div className="mt-2">
                  <img
                    src={instructor.signature}
                    alt="Signature"
                    className="max-w-xs h-auto max-h-48 object-contain rounded-lg border border-border"
                  />
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('profile.noSignature')}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}
