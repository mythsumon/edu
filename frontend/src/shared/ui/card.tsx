import * as React from "react";
import { cn } from "@/shared/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional className to merge with default card styles
   */
  className?: string;
  /**
   * Card content
   */
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col rounded-xl border border-border/60 bg-card shadow-sm px-4 py-6 space-y-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };
