import { z } from 'zod'

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
    mainLecturers: z
      .number({ error: t('training.validation.mainLecturersMustBeNumber') })
      .min(1, t('training.validation.mainLecturersRequired')),
    assistantLecturers: z
      .number({ error: t('training.validation.assistantLecturersMustBeNumber') })
      .min(0, t('training.validation.assistantLecturersRequired')),
  })

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
    grade: z
      .string()
      .min(1, t('training.validation.gradeRequired')),
    class: z
      .string()
      .min(1, t('training.validation.classRequired')),
    numberOfStudents: z
      .number({ error: t('training.validation.numberOfStudentsMustBeNumber') })
      .min(1, t('training.validation.numberOfStudentsRequired')),
    numberOfClasses: z
      .number({ error: t('training.validation.numberOfClassesMustBeNumber') })
      .min(1, t('training.validation.numberOfClassesRequired')),
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
    grade: z
      .string()
      .min(1, t('training.validation.gradeRequired')),
    class: z
      .string()
      .min(1, t('training.validation.classRequired')),
    numberOfStudents: z
      .number({ error: t('training.validation.numberOfStudentsMustBeNumber') })
      .min(1, t('training.validation.numberOfStudentsRequired')),
    numberOfClasses: z
      .number({ error: t('training.validation.numberOfClassesMustBeNumber') })
      .min(1, t('training.validation.numberOfClassesRequired')),
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

export type UpdateTrainingFormData = z.infer<
  ReturnType<typeof updateTrainingSchema>
>
