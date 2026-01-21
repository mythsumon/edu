import { useState, useRef, useEffect } from 'react'
import { UseFormRegisterReturn, FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { FormField } from './FormField'

// Merge refs helper
const mergeRefs = <T,>(...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined>) => {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

interface FormPasswordFieldProps {
  id: string
  label: string
  placeholder: string
  register: UseFormRegisterReturn
  error?: FieldError
  required?: boolean
  isSubmitting?: boolean
  autoComplete?: string
}

export const FormPasswordField = ({
  id,
  label,
  placeholder,
  register,
  error,
  required = false,
  isSubmitting = false,
  autoComplete = 'new-password',
}: FormPasswordFieldProps) => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Prevent autofill by making field readOnly initially, then removing on focus
  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    const handleFocus = () => {
      if (input.hasAttribute('readonly')) {
        input.removeAttribute('readonly')
      }
    }

    const handleBlur = () => {
      // Re-add readonly on blur to prevent autofill on next focus
      input.setAttribute('readonly', 'readonly')
    }

    // Set initial readonly to prevent autofill
    input.setAttribute('readonly', 'readonly')

    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)

    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Merge react-hook-form ref with our ref
  const { ref: registerRef, ...registerProps } = register

  return (
    <FormField id={id} label={label} required={required} error={error}>
      <div className="relative">
        <Input
          ref={mergeRefs(inputRef, registerRef)}
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          readOnly
          {...registerProps}
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
