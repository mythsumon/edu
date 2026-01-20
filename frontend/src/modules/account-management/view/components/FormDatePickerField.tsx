import { useState, ReactNode } from 'react'
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { FormField } from './FormField'
import { formatDateDot } from '@/shared/lib/date'

interface FormDatePickerFieldProps<TFieldValues extends FieldValues> {
  id: string
  name: Path<TFieldValues>
  label: string
  placeholder: string
  control: Control<TFieldValues>
  error?: FieldError
  required?: boolean
  isSubmitting?: boolean
}

export const FormDatePickerField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  error,
  required = false,
  isSubmitting = false,
}: FormDatePickerFieldProps<TFieldValues>) => {
  const { t } = useTranslation()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let date: Date | undefined
          try {
            date = field.value && field.value.trim() !== '' ? new Date(field.value) : undefined
            // Check if date is valid
            if (date && isNaN(date.getTime())) {
              date = undefined
            }
          } catch {
            date = undefined
          }

          return (
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    id={id}
                    className={`h-10 w-full rounded-lg border bg-secondary/40 px-3 py-2 pl-10 pr-3 text-sm md:text-xs text-left justify-between font-normal hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out ${error ? 'ring-2 ring-destructive' : ''} ${!date ? 'text-muted-foreground/60' : ''}`}
                    disabled={isSubmitting}
                    onBlur={field.onBlur}
                  >
                    <span className="flex-1 text-left">
                      {date ? formatDateDot(date) : placeholder}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 ml-2" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  disabled={(date) => date > new Date()}
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      // Convert Date to YYYY-MM-DD string format
                      const year = selectedDate.getFullYear()
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                      const day = String(selectedDate.getDate()).padStart(2, '0')
                      field.onChange(`${year}-${month}-${day}`, { shouldValidate: false })
                    } else {
                      field.onChange('', { shouldValidate: false })
                    }
                    setDatePickerOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          )
        }}
      />
    </FormField>
  )
}
