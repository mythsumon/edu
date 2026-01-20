import { cn } from '@/shared/lib/cn'

interface StatusBadgeProps {
  status: string
  className?: string
}

/**
 * Common Status Badge Component
 * Displays status with appropriate styling based on status value
 * Uses palette colors for consistent theming
 */
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  if (!status) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  const statusLower = status.toLowerCase()

  // Map status to badge variant using palette colors
  const getStatusVariant = () => {
    if (statusLower === 'active' || statusLower.includes('active')) {
      return 'bg-primary/10 text-primary border border-primary/20'
    }
    if (statusLower === 'blocked' || statusLower.includes('blocked')) {
      return 'bg-destructive/10 text-destructive border border-destructive/20'
    }
    if (statusLower === 'inactive' || statusLower.includes('inactive')) {
      return 'bg-muted text-muted-foreground border border-border'
    }
    if (statusLower === 'suspended' || statusLower.includes('suspended')) {
      return 'bg-accent text-accent-foreground border border-border'
    }
    // Default variant
    return 'bg-secondary text-secondary-foreground border border-border'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium border',
        getStatusVariant(),
        className
      )}
    >
      {status}
    </span>
  )
}
