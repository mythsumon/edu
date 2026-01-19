import { z } from 'zod'

export const createProgramSchema = (t: (key: string) => string) =>
  z.object({
    programName: z
      .string()
      .min(1, t('program.validation.programNameRequired'))
      .max(255, t('program.validation.programNameMaxLength')),
    sessionPart: z
      .string()
      .min(1, t('program.validation.sessionPartRequired')),
    status: z
      .string()
      .min(1, t('program.validation.statusRequired')),
    programType: z
      .string()
      .min(1, t('program.validation.programTypeRequired')),
    notes: z.string().optional(),
  })

export type CreateProgramFormData = z.infer<
  ReturnType<typeof createProgramSchema>
>

export const updateProgramSchema = (t: (key: string) => string) =>
  z.object({
    programName: z
      .string()
      .min(1, t('program.validation.programNameRequired'))
      .max(255, t('program.validation.programNameMaxLength')),
    sessionPart: z
      .string()
      .min(1, t('program.validation.sessionPartRequired')),
    status: z
      .string()
      .min(1, t('program.validation.statusRequired')),
    programType: z
      .string()
      .min(1, t('program.validation.programTypeRequired')),
    notes: z.string().optional(),
  })

export type UpdateProgramFormData = z.infer<
  ReturnType<typeof updateProgramSchema>
>
