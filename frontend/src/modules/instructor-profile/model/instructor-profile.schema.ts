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
  gender: z
    .string()
    .min(1, t('accountManagement.validation.genderRequired')),
  dob: z
    .string()
    .min(1, t('accountManagement.validation.dateOfBirthRequired')),
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
})

export type UpdateInstructorProfileFormData = z.infer<ReturnType<typeof updateInstructorProfileSchema>>
