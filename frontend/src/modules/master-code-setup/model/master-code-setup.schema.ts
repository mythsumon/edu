import { z } from 'zod'

export const createMasterCodeSchema = (t: (key: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('masterCode.validation.codeRequired')),
  codeName: z
    .string()
    .min(1, t('masterCode.validation.codeNameRequired')),
  parentId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
})

export type CreateMasterCodeFormData = z.infer<ReturnType<typeof createMasterCodeSchema>>

export const updateMasterCodeSchema = (t: (key: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('masterCode.validation.codeRequired')),
  codeName: z
    .string()
    .min(1, t('masterCode.validation.codeNameRequired')),
  parentId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
})

export type UpdateMasterCodeFormData = z.infer<ReturnType<typeof updateMasterCodeSchema>>
