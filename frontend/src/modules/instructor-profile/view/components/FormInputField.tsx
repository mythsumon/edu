import { InputHTMLAttributes, ReactNode } from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { FormField } from './FormField'

interface FormInputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  placeholder: string
  icon?: ReactNode
  register: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  isSubmitting?: boolean
}

export const FormInputField = ({
  id,
  label,
  placeholder,
  icon,
  register,
  error,
  required = false,
  isSubmitting = false,
  className,
  ...inputProps
}: FormInputFieldProps) => {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Input
        id={id}
        placeholder={placeholder}
        icon={icon}
        {...register}
        className={error ? 'ring-2 ring-destructive' : ''}
        disabled={isSubmitting}
        {...inputProps}
      />
    </FormField>
  )
}
