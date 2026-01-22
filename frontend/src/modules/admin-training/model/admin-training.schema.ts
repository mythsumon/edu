import { z } from 'zod'

/**
 * Helper to create a number schema that handles NaN from empty inputs.
 * When valueAsNumber: true is used with an empty input, it returns NaN.
 * This uses z.number().transform() with refine to handle NaN properly.
 */
const requiredNumber = (minValue: number, errorRequired: string, errorMin: string) =>
  z.number({ error: errorRequired })
    .refine((val) => !isNaN(val), { message: errorRequired })
    .refine((val) => val >= minValue, { message: errorMin })

const periodSchema = (t: (key: string) => string) =>
  z.object({
    date: z
      .string()
      .min(1, t('training.validation.periodDateRequired')),
    startTime: z
      .string()
      .min(1, t('training.validation.periodStartTimeRequired')),
    endTime: z
      .string()
      .min(1, t('training.validation.periodEndTimeRequired')),
    mainLecturers: requiredNumber(
      1,
      t('training.validation.mainLecturersMustBeNumber'),
      t('training.validation.mainLecturersRequired')
    ),
    assistantLecturers: requiredNumber(
      0,
      t('training.validation.assistantLecturersMustBeNumber'),
      t('training.validation.assistantLecturersRequired')
    ),
  })

export const createAdminTrainingSchema = (t: (key: string) => string) =>
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
    grade: z
      .string()
      .min(1, t('training.validation.gradeRequired')),
    class: z
      .string()
      .min(1, t('training.validation.classRequired')),
    numberOfStudents: requiredNumber(
      1,
      t('training.validation.numberOfStudentsMustBeNumber'),
      t('training.validation.numberOfStudentsRequired')
    ),
    numberOfPeriods: requiredNumber(
      1,
      t('training.validation.numberOfPeriodsMustBeNumber'),
      t('training.validation.numberOfPeriodsRequired')
    ),
    periods: z.array(periodSchema(t)).min(1),
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

export type CreateAdminTrainingFormData = z.infer<
  ReturnType<typeof createAdminTrainingSchema>
>

export const updateAdminTrainingSchema = (t: (key: string) => string) =>
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
    grade: z
      .string()
      .min(1, t('training.validation.gradeRequired')),
    class: z
      .string()
      .min(1, t('training.validation.classRequired')),
    numberOfStudents: requiredNumber(
      1,
      t('training.validation.numberOfStudentsMustBeNumber'),
      t('training.validation.numberOfStudentsRequired')
    ),
    numberOfPeriods: requiredNumber(
      1,
      t('training.validation.numberOfPeriodsMustBeNumber'),
      t('training.validation.numberOfPeriodsRequired')
    ),
    periods: z.array(periodSchema(t)).min(1),
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

export type UpdateAdminTrainingFormData = z.infer<
  ReturnType<typeof updateAdminTrainingSchema>
>
