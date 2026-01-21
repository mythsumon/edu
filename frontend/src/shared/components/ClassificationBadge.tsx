import { cn } from '@/shared/lib/cn'

interface ClassificationBadgeProps {
  classification: string
  className?: string
}

/**
 * Common Classification Badge Component
 * Displays classification with appropriate styling based on classification value
 * Uses palette colors for consistent theming
 */
export const ClassificationBadge = ({ classification, className }: ClassificationBadgeProps) => {
  if (!classification) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  const classificationLower = classification.toLowerCase()

  // Map classification to badge variant using palette colors
  const getClassificationVariant = () => {
    if (classificationLower.includes('basic') || classificationLower.includes('기본') || classificationLower.includes('일반')) {
      return 'bg-primary/10 text-primary border border-primary/20'
    }
    if (classificationLower.includes('intermediate') || classificationLower.includes('중급')) {
      return 'bg-accent text-accent-foreground border border-border'
    }
    if (classificationLower.includes('advanced') || classificationLower.includes('고급')) {
      return 'bg-secondary text-secondary-foreground border border-border'
    }
    if (classificationLower.includes('preparation') || classificationLower.includes('준비')) {
      return 'bg-muted text-muted-foreground border border-border'
    }
    // Default variant
    return 'bg-secondary text-secondary-foreground border border-border'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium border',
        getClassificationVariant(),
        className
      )}
    >
      {classification}
    </span>
  )
}
