import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export interface TrainingCardStatus {
  label: string;
  variant?: "default" | "success" | "warning" | "destructive";
  dotColor?: string;
}

export interface TrainingCardDetail {
  icon: LucideIcon;
  label: string;
}

export interface TrainingCardProps {
  /**
   * Training title/name
   */
  title: string;
  /**
   * Status badge information
   */
  status?: TrainingCardStatus;
  /**
   * Training details (location, date, class, time)
   */
  details: TrainingCardDetail[];
  /**
   * Action button configuration
   */
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
  };
  /**
   * Additional className for the card
   */
  className?: string;
  /**
   * Whether to show hover effect
   */
  hoverable?: boolean;
}

/**
 * Training Card Component
 * A reusable card component for displaying training information
 */
export const TrainingCard = ({
  title,
  status,
  details,
  actionButton,
  className,
  hoverable = true,
}: TrainingCardProps) => {
  const getStatusDotColor = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-primary";
      case "warning":
        return "bg-accent";
      case "destructive":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  return (
    <Card
      className={cn(
        "rounded-xl border-border bg-card shadow-sm transition-all duration-200",
        hoverable && "hover:shadow-lg hover:border-border/40",
        "flex flex-col h-full p-6",
        className
      )}
    >
      {/* Card Body */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Title and Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2">
            {title}
          </h3>
          {status && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  status.dotColor || getStatusDotColor(status.variant)
                )}
              />
              <span className="text-sm text-muted-foreground">
                {status.label}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2.5">
          {details.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground/70" />
                <span className="line-clamp-2 leading-relaxed">{detail.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      {actionButton && (
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            className="w-full"
            variant={actionButton.variant || "default"}
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
          >
            {actionButton.label}
          </Button>
        </div>
      )}
    </Card>
  );
};
