import { z } from 'zod'

export const createInstitutionSchema = (t: (key: string) => string) =>
  z.object({
    institutionName: z
      .string()
      .min(1, t('institution.validation.institutionNameRequired'))
      .max(255, t('institution.validation.institutionNameMaxLength')),
    phoneNumber: z
      .string()
      .min(1, t('institution.validation.phoneNumberRequired'))
      .regex(/^[0-9+\-\s()]+$/, t('institution.validation.phoneNumberInvalid')),
    district: z
      .string()
      .min(1, t('institution.validation.districtRequired')),
    zone: z
      .string()
      .min(1, t('institution.validation.zoneRequired')),
    region: z
      .string()
      .min(1, t('institution.validation.regionRequired')),
    streetRoad: z
      .string()
      .min(1, t('institution.validation.streetRoadRequired')),
    detailAddress: z
      .string()
      .min(1, t('institution.validation.detailAddressRequired')),
    majorCategory: z
      .string()
      .min(1, t('institution.validation.majorCategoryRequired')),
    category1: z
      .string()
      .min(1, t('institution.validation.category1Required')),
    category2: z
      .string()
      .min(1, t('institution.validation.category2Required')),
    institutionLevelClassification: z
      .string()
      .min(1, t('institution.validation.institutionLevelClassificationRequired')),
    contactName: z
      .string()
      .min(1, t('institution.validation.contactNameRequired')),
    contactPhoneNumber: z
      .string()
      .min(1, t('institution.validation.contactPhoneNumberRequired')),
    contactEmail: z
      .string()
      .min(1, t('institution.validation.contactEmailRequired'))
      .email(t('institution.validation.contactEmailInvalid')),
    notes: z.string().optional(),
  })

export type CreateInstitutionFormData = z.infer<
  ReturnType<typeof createInstitutionSchema>
>

// Update schema is the same as create schema
export const updateInstitutionSchema = createInstitutionSchema

export type UpdateInstitutionFormData = CreateInstitutionFormData
