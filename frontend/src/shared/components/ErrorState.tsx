import { useTranslation } from 'react-i18next'
import type { ApiError } from '../http/types/common'

interface ErrorStateProps {
  error?: string | Error | ApiError
  onRetry?: () => void
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation()
  
  const getErrorMessage = (): string => {
    if (!error) return t('errors.generic')
    
    if (typeof error === 'string') return error
    
    if (error instanceof Error) return error.message
    
    // Handle ApiError object
    if (typeof error === 'object' && 'message' in error) {
      return error.message || t('errors.generic')
    }
    
    return t('errors.generic')
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
      <p className="text-lg font-semibold text-destructive mb-2">{t('common.error')}</p>
      <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}

