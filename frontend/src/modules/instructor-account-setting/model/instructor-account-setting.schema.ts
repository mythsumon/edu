import { z } from 'zod'

/**
 * Change Password Request DTO Schema
 * Matches backend ChangePasswordRequestDto validation:
 * - currentPassword: @NotBlank
 * - newPassword: @NotBlank, @Size(min = 8, max = 100)
 */
export const changePasswordRequestSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must be at most 100 characters'),
})

/**
 * Change Password Request DTO Type
 * Inferred from Zod schema
 */
export type ChangePasswordRequestDto = z.infer<typeof changePasswordRequestSchema>

/**
 * Change Password Response DTO Schema
 * The API returns null for data on success
 */
export const changePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

/**
 * Change Password Response DTO Type
 * Inferred from Zod schema
 */
export type ChangePasswordResponseDto = z.infer<typeof changePasswordResponseSchema>

/**
 * Schema for changing password form
 * Used for form validation with translations
 */
export const changePasswordSchema = (t: (key: string) => string) => z.object({
  oldPassword: z
    .string()
    .min(1, t('accountSettings.validation.oldPasswordRequired')),
  newPassword: z
    .string()
    .min(1, t('accountSettings.validation.newPasswordRequired'))
    .min(8, t('accountSettings.validation.newPasswordMinLength'))
    .max(100, t('accountSettings.validation.newPasswordMaxLength')),
  confirmPassword: z
    .string()
    .min(1, t('accountSettings.validation.confirmPasswordRequired')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('accountSettings.validation.passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

/**
 * Change Password Form Data Type
 * Inferred from Zod schema
 */
export type ChangePasswordFormData = z.infer<ReturnType<typeof changePasswordSchema>>
