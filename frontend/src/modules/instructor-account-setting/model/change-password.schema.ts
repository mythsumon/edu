import { z } from 'zod'

/**
 * Schema for changing password
 */
export const changePasswordSchema = (t: (key: string) => string) => z.object({
  oldPassword: z
    .string()
    .min(1, t('accountSettings.validation.oldPasswordRequired')),
  newPassword: z
    .string()
    .min(1, t('accountSettings.validation.newPasswordRequired'))
    .min(6, t('accountSettings.validation.newPasswordMinLength')),
  confirmPassword: z
    .string()
    .min(1, t('accountSettings.validation.confirmPasswordRequired')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('accountSettings.validation.passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export type ChangePasswordFormData = z.infer<ReturnType<typeof changePasswordSchema>>
