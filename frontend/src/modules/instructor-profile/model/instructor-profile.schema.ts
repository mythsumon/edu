import { z } from 'zod'

/**
 * Schema for updating instructor profile (simplified - only editable fields)
 */
export const updateInstructorProfileSchema = (t: (key: string) => string) => z.object({
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  phone: z
    .string()
    .min(1, t('accountManagement.validation.phoneNumberRequired')),
  interfaceLanguage: z
    .string()
    .min(1, t('profile.validation.interfaceLanguageRequired')),
})

export type UpdateInstructorProfileFormData = z.infer<ReturnType<typeof updateInstructorProfileSchema>>
