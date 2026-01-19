import { ReactNode, useState } from 'react'
import { ChevronUp } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  description?: string
  defaultExpanded?: boolean
  children: ReactNode
}

export const CollapsibleCard = ({
  title,
  description,
  defaultExpanded = true,
  children,
}: CollapsibleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <ChevronUp
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ml-4 ${
            isExpanded ? '' : 'rotate-180'
          }`}
        />
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      )}
    </div>
  )
}
