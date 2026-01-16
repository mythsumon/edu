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
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: t('accountManagement.validation.emailInvalid'),
    })
    .optional(),
  phone: z
    .string()
    .optional(),
})

export type CreateAdminFormData = z.infer<ReturnType<typeof createAdminSchema>>

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
  city: z
    .string()
    .min(1, t('accountManagement.validation.cityRequired'))
    .max(255, t('accountManagement.validation.cityMaxLength')),
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
