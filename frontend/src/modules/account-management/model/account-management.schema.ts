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
    .optional(),
  gender: z
    .string()
    .optional(),
  dob: z
    .string()
    .optional(),
  regionId: z
    .string()
    .optional(),
  city: z
    .string()
    .optional(),
  street: z
    .string()
    .optional(),
  detailAddress: z
    .string()
    .optional(),
  statusId: z
    .string()
    .optional(),
  classificationId: z
    .string()
    .optional(),
})

export type CreateInstructorFormData = z.infer<typeof createInstructorSchema>
