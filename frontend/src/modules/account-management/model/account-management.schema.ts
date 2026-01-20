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