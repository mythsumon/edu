import { z } from 'zod'
import i18n from '@/app/config/i18n'

export const createLoginSchema = () => z.object({
  username: z
    .string()
    .min(1, i18n.t('auth.validation.usernameRequired')),
  password: z
    .string()
    .min(1, i18n.t('auth.validation.passwordRequired')),
})

export const loginSchema = createLoginSchema()

export type LoginFormData = z.infer<typeof loginSchema>

