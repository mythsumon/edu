import { z } from 'zod'

export const createCommonCodeSchema = (t: (key: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('commonCode.validation.codeRequired')),
  codeName: z
    .string()
    .min(1, t('commonCode.validation.codeNameRequired')),
  parentId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
})

export type CreateCommonCodeFormData = z.infer<ReturnType<typeof createCommonCodeSchema>>

export const updateCommonCodeSchema = (t: (key: string) => string) => z.object({
  code: z
    .string()
    .min(1, t('commonCode.validation.codeRequired')),
  codeName: z
    .string()
    .min(1, t('commonCode.validation.codeNameRequired')),
  parentId: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),
})

export type UpdateCommonCodeFormData = z.infer<ReturnType<typeof updateCommonCodeSchema>>
