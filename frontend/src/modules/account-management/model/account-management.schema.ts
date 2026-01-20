import { z } from 'zod'

export const createAdminSchema = (t: (key: string) => string) => z.object({
  username: z
    .string()
    .nonempty(t('accountManagement.validation.usernameRequired'))
    .max(50, t('accountManagement.validation.usernameMaxLength')),
  password: z
    .string()
    .min(6, t('accountManagement.validation.passwordMinLength')),
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .optional(),
})

export type CreateAdminFormData = z.infer<ReturnType<typeof createAdminSchema>>

export const updateAdminSchema = (t: (key: string) => string) => z.object({
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .optional(),
})

export type UpdateAdminFormData = z.infer<ReturnType<typeof updateAdminSchema>>

export const createInstructorSchema = (t: (key: string) => string) => z.object({
  username: z
    .string()
    .nonempty(t('accountManagement.validation.usernameRequired'))
    .max(50, t('accountManagement.validation.usernameMaxLength')),
  password: z
    .string()
    .min(6, t('accountManagement.validation.passwordMinLength')),
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .min(1, t('accountManagement.validation.phoneNumberRequired')),
  gender: z
    .string()
    .min(1, t('accountManagement.validation.genderRequired')),
  dob: z
    .string()
    .min(1, t('accountManagement.validation.dateOfBirthRequired')),
  zoneId: z
    .string()
    .min(1, t('accountManagement.validation.zoneRequired')),
  regionId: z
    .string()
    .min(1, t('accountManagement.validation.regionRequired')),
  cityId: z
    .string()
    .min(1, t('accountManagement.validation.cityRequired')),
  street: z
    .string()
    .min(1, t('accountManagement.validation.streetRequired'))
    .max(255, t('accountManagement.validation.streetMaxLength')),
  detailAddress: z
    .string()
    .min(1, t('accountManagement.validation.buildingNameLakeNumberRequired'))
    .max(255, t('accountManagement.validation.buildingNameLakeNumberMaxLength')),
  statusId: z
    .string()
    .min(1, t('accountManagement.validation.statusRequired')),
  classificationId: z
    .string()
    .min(1, t('accountManagement.validation.classificationRequired')),
  affiliation: z
    .string()
    .refine((val) => val === '' || val.length <= 255, {
      message: t('accountManagement.validation.affiliationMaxLength'),
    })
    .optional(),
})

export type CreateInstructorFormData = z.infer<ReturnType<typeof createInstructorSchema>>

export const updateInstructorSchema = (t: (key: string) => string) => z.object({
  username: z
    .string()
    .nonempty(t('accountManagement.validation.usernameRequired'))
    .max(50, t('accountManagement.validation.usernameMaxLength')),
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .min(1, t('accountManagement.validation.phoneNumberRequired')),
  gender: z
    .string()
    .min(1, t('accountManagement.validation.genderRequired')),
  dob: z
    .string()
    .min(1, t('accountManagement.validation.dateOfBirthRequired')),
  zoneId: z
    .string()
    .min(1, t('accountManagement.validation.zoneRequired')),
  regionId: z
    .string()
    .min(1, t('accountManagement.validation.regionRequired')),
  cityId: z
    .string()
    .min(1, t('accountManagement.validation.cityRequired')),
  street: z
    .string()
    .min(1, t('accountManagement.validation.streetRequired'))
    .max(255, t('accountManagement.validation.streetMaxLength')),
  detailAddress: z
    .string()
    .min(1, t('accountManagement.validation.buildingNameLakeNumberRequired'))
    .max(255, t('accountManagement.validation.buildingNameLakeNumberMaxLength')),
  statusId: z
    .string()
    .min(1, t('accountManagement.validation.statusRequired')),
  classificationId: z
    .string()
    .min(1, t('accountManagement.validation.classificationRequired')),
  affiliation: z
    .string()
    .refine((val) => val === '' || val.length <= 255, {
      message: t('accountManagement.validation.affiliationMaxLength'),
    })
    .optional(),
})

export type UpdateInstructorFormData = z.infer<ReturnType<typeof updateInstructorSchema>>

export const createTeacherSchema = (t: (key: string) => string) => z.object({
  username: z
    .string()
    .nonempty(t('accountManagement.validation.usernameRequired'))
    .max(50, t('accountManagement.validation.usernameMaxLength')),
  password: z
    .string()
    .min(6, t('accountManagement.validation.passwordMinLength')),
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .optional(),
  statusId: z
    .string()
    .min(1, t('accountManagement.validation.statusRequired')),
})

export type CreateTeacherFormData = z.infer<ReturnType<typeof createTeacherSchema>>

export const updateTeacherSchema = (t: (key: string) => string) => z.object({
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .optional(),
  statusId: z
    .string()
    .min(1, t('accountManagement.validation.statusRequired')),
})

export type UpdateTeacherFormData = z.infer<ReturnType<typeof updateTeacherSchema>>

/**
 * Schema for changing password
 */
export const changePasswordSchema = (t: (key: string) => string) => z.object({
  currentPassword: z
    .string()
    .min(1, t('accountManagement.validation.currentPasswordRequired')),
  newPassword: z
    .string()
    .min(8, t('accountManagement.validation.passwordMinLength'))
    .max(100, t('accountManagement.validation.passwordMaxLength')),
  confirmPassword: z
    .string()
    .min(1, t('accountManagement.validation.confirmPasswordRequired')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('accountManagement.validation.passwordsDoNotMatch'),
  path: ['confirmPassword'],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: t('accountManagement.validation.newPasswordSameAsCurrent'),
  path: ['newPassword'],
})

export type ChangePasswordFormData = z.infer<ReturnType<typeof changePasswordSchema>>

/**
 * Schema for updating own profile (admin)
 */
export const updateOwnProfileAdminSchema = (t: (key: string) => string) => updateAdminSchema(t)
export type UpdateOwnProfileAdminFormData = z.infer<ReturnType<typeof updateOwnProfileAdminSchema>>

/**
 * Schema for updating own profile (instructor)
 */
export const updateOwnProfileInstructorSchema = (t: (key: string) => string) => z.object({
  name: z
    .string()
    .min(1, t('accountManagement.validation.nameRequired'))
    .max(255, t('accountManagement.validation.nameMaxLength')),
  email: z
    .string()
    .min(1, t('accountManagement.validation.emailRequired'))
    .email(t('accountManagement.validation.emailInvalid')),
  phone: z
    .string()
    .min(1, t('accountManagement.validation.phoneNumberRequired')),
  gender: z
    .string()
    .min(1, t('accountManagement.validation.genderRequired')),
  dob: z
    .string()
    .min(1, t('accountManagement.validation.dateOfBirthRequired')),
  zoneId: z
    .string()
    .min(1, t('accountManagement.validation.zoneRequired')),
  regionId: z
    .string()
    .min(1, t('accountManagement.validation.regionRequired')),
  cityId: z
    .string()
    .min(1, t('accountManagement.validation.cityRequired')),
  street: z
    .string()
    .min(1, t('accountManagement.validation.streetRequired'))
    .max(255, t('accountManagement.validation.streetMaxLength')),
  detailAddress: z
    .string()
    .min(1, t('accountManagement.validation.buildingNameLakeNumberRequired'))
    .max(255, t('accountManagement.validation.buildingNameLakeNumberMaxLength')),
  affiliation: z
    .string()
    .refine((val) => val === '' || val.length <= 255, {
      message: t('accountManagement.validation.affiliationMaxLength'),
    })
    .optional(),
})
export type UpdateOwnProfileInstructorFormData = z.infer<ReturnType<typeof updateOwnProfileInstructorSchema>>

/**
 * Schema for updating own profile (teacher)
 */
export const updateOwnProfileTeacherSchema = (t: (key: string) => string) => updateTeacherSchema(t)
export type UpdateOwnProfileTeacherFormData = z.infer<ReturnType<typeof updateOwnProfileTeacherSchema>>