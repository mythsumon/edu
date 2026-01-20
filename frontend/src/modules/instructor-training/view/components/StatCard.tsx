import * as React from "react";
import { cn } from "@/shared/lib/cn";

export interface StatCardProps {
  /**
   * Title/label for the stat card
   */
  title: string;
  /**
   * Value to display
   */
  value: string | number;
  /**
   * Color variant for the value
   */
  variant?: "default" | "primary" | "success" | "destructive" | "muted";
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Stat Card Component
 * Displays a statistic with title and value
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, variant = "default", className, ...props }, ref) => {
    const valueColorClass = React.useMemo(() => {
      switch (variant) {
        case "primary":
          return "text-primary";
        case "success":
          return "text-primary"; // Using primary for success
        case "destructive":
          return "text-destructive";
        case "muted":
          return "text-muted-foreground";
        default:
          return "text-foreground";
      }
    }, [variant]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-xl border border-border bg-card px-6 py-5 shadow-sm",
          className
        )}
        {...props}
      >
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        <p className={cn("text-3xl font-bold", valueColorClass)}>{value}</p>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
