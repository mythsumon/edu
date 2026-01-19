import { z } from 'zod'

export const createTrainingSchema = (t: (key: string) => string) =>
  z.object({
    trainingName: z
      .string()
      .min(1, t('training.validation.trainingNameRequired'))
      .max(255, t('training.validation.trainingNameMaxLength')),
    program: z
      .string()
      .min(1, t('training.validation.programRequired')),
    institution: z
      .string()
      .min(1, t('training.validation.institutionRequired')),
    description: z.string().optional(),
    startDate: z
      .string()
      .min(1, t('training.validation.startDateRequired')),
    endDate: z
      .string()
      .min(1, t('training.validation.endDateRequired')),
    notes: z.string().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: t('training.validation.endDateMustBeAfterStartDate'),
      path: ['endDate'],
    }
  )

export type CreateTrainingFormData = z.infer<
  ReturnType<typeof createTrainingSchema>
>

export const updateTrainingSchema = (t: (key: string) => string) =>
  z.object({
    trainingName: z
      .string()
      .min(1, t('training.validation.trainingNameRequired'))
      .max(255, t('training.validation.trainingNameMaxLength')),
    program: z
      .string()
      .min(1, t('training.validation.programRequired')),
    institution: z
      .string()
      .min(1, t('training.validation.institutionRequired')),
    description: z.string().optional(),
    startDate: z
      .string()
      .min(1, t('training.validation.startDateRequired')),
    endDate: z
      .string()
      .min(1, t('training.validation.endDateRequired')),
    notes: z.string().optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: t('training.validation.endDateMustBeAfterStartDate'),
      path: ['endDate'],
    }
  )

export type UpdateTrainingFormData = z.infer<
  ReturnType<typeof updateTrainingSchema>
>
