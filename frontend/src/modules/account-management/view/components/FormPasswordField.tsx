import { useState, ReactNode } from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { FormField } from './FormField'

interface FormPasswordFieldProps {
  id: string
  label: string
  placeholder: string
  register: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  isSubmitting?: boolean
}

export const FormPasswordField = ({
  id,
  label,
  placeholder,
  register,
  error,
  required = false,
  isSubmitting = false,
}: FormPasswordFieldProps) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormField id={id} label={label} required={required} error={error}>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          icon={<Lock className="h-4 w-4" />}
          {...register}
          className={error ? 'ring-2 ring-destructive pr-10' : 'pr-10'}
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={isSubmitting}
          aria-label={showPassword ? t('accountManagement.hidePassword') : t('accountManagement.showPassword')}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  )
}
