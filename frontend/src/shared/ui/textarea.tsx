import * as React from "react"

import { cn } from "@/shared/lib/cn"

export interface TextareaProps
  extends React.ComponentProps<"textarea"> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border bg-secondary/40 px-3 py-2 text-sm md:text-xs ring-offset-background placeholder:text-muted-foreground/60 placeholder:text-xs placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
