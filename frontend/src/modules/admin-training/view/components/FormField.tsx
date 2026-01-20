import { ReactNode } from 'react'
import { Label } from '@/shared/ui/label'
import { FieldError } from 'react-hook-form'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: FieldError
  children: ReactNode
}

export const FormField = ({
  id,
  label,
  required = false,
  error,
  children,
}: FormFieldProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-secondary-foreground/80">
        {label}
        {required && <span className="text-destructive">**</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}
