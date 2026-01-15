import { z } from 'zod'

export const createAdminSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(255, 'First name must be at most 255 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(255, 'Last name must be at most 255 characters'),
  email: z
    .string()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email must be valid',
    })
    .optional(),
  phone: z
    .string()
    .optional(),
})

export type CreateAdminFormData = z.infer<typeof createAdminSchema>

export const createInstructorSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(255, 'First name must be at most 255 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(255, 'Last name must be at most 255 characters'),
  email: z
    .string()
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email must be valid',
    })
    .optional(),
  phone: z
    .string()
    .min(1, 'Phone number is required'),
  gender: z
    .string()
    .min(1, 'Gender is required'),
  dob: z
    .string()
    .min(1, 'Date of birth is required'),
  zoneId: z
    .string()
    .min(1, 'Zone is required'),
  regionId: z
    .string()
    .min(1, 'Region is required'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(255, 'City must be at most 255 characters'),
  street: z
    .string()
    .min(1, 'Street is required')
    .max(255, 'Street must be at most 255 characters'),
  detailAddress: z
    .string()
    .min(1, 'Building name / lake number is required')
    .max(255, 'Building name / lake number must be at most 255 characters'),
  statusId: z
    .string()
    .min(1, 'Status is required'),
  classificationId: z
    .string()
    .min(1, 'Classification is required'),
})

export type CreateInstructorFormData = z.infer<typeof createInstructorSchema>
