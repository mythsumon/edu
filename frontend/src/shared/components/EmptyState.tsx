import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = ({ 
  title, 
  description,
  action 
}: EmptyStateProps) => {
  const { t } = useTranslation()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
      <p className="text-lg font-semibold text-foreground mb-2">
        {title || t('empty.noData')}
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        {description || t('empty.noDataDescription')}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}

