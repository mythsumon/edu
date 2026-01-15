import { ReactNode } from 'react'
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { FormField } from './FormField'

interface FormSelectFieldProps<TFieldValues extends FieldValues, TOption = unknown> {
  id: string
  name: Path<TFieldValues>
  label: string
  placeholder: string
  icon: ReactNode
  control: Control<TFieldValues>
  options: TOption[]
  getOptionValue: (option: TOption) => string
  getOptionLabel: (option: TOption) => string
  error?: FieldError
  required?: boolean
  isSubmitting?: boolean
  isLoading?: boolean
  disabled?: boolean
  onValueChange?: (value: string) => void
  displayValue?: (value: string | undefined) => ReactNode
}

export const FormSelectField = <TFieldValues extends FieldValues, TOption = unknown>({
  id,
  name,
  label,
  placeholder,
  icon,
  control,
  options,
  getOptionValue,
  getOptionLabel,
  error,
  required = false,
  isSubmitting = false,
  isLoading = false,
  disabled = false,
  onValueChange,
  displayValue,
}: FormSelectFieldProps<TFieldValues, TOption>) => {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const handleValueChange = (value: string) => {
            if (onValueChange) {
              onValueChange(value)
            } else {
              field.onChange(value || '')
            }
          }

          return (
            <Select
              value={field.value || undefined}
              onValueChange={handleValueChange}
              disabled={isSubmitting || isLoading || disabled}
            >
              <SelectTrigger
                icon={icon}
                className={`${error ? 'ring-2 ring-destructive' : ''} ${!field.value ? 'text-muted-foreground/60' : ''}`}
              >
                {displayValue ? (
                  <SelectValue placeholder={placeholder}>{displayValue(field.value)}</SelectValue>
                ) : (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={getOptionValue(option)} value={getOptionValue(option)}>
                    {getOptionLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }}
      />
    </FormField>
  )
}
