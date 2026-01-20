import * as React from "react";
import { cn } from "@/shared/lib/cn";
import { StatCard, type StatCardProps } from "./StatCard";

export interface StatsContainerProps {
  /**
   * Array of stat card configurations
   */
  stats: StatCardProps[];
  /**
   * Number of columns on different screen sizes
   */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Gap between cards
   */
  gap?: "sm" | "md" | "lg";
  /**
   * Additional className
   */
  className?: string;
}

/**
 * Stats Container Component
 * Displays a grid of stat cards
 */
export const StatsContainer = ({
  stats,
  columns = { default: 1, sm: 2, md: 2, lg: 4 },
  gap = "md",
  className,
}: StatsContainerProps) => {
  // Map column numbers to explicit Tailwind classes
  const getGridColsClass = (num: number): string => {
    const map: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    return map[num] || "grid-cols-1";
  };

  const gridColsClass = React.useMemo(() => {
    const classes: string[] = [];
    if (columns.default) {
      classes.push(getGridColsClass(columns.default));
    }
    if (columns.sm) {
      classes.push(`sm:${getGridColsClass(columns.sm)}`);
    }
    if (columns.md) {
      classes.push(`md:${getGridColsClass(columns.md)}`);
    }
    if (columns.lg) {
      classes.push(`lg:${getGridColsClass(columns.lg)}`);
    }
    if (columns.xl) {
      classes.push(`xl:${getGridColsClass(columns.xl)}`);
    }
    return classes.join(" ");
  }, [columns]);

  const gapClass = React.useMemo(() => {
    switch (gap) {
      case "sm":
        return "gap-3";
      case "md":
        return "gap-4";
      case "lg":
        return "gap-6";
      default:
        return "gap-4";
    }
  }, [gap]);

  return (
    <div
      className={cn(
        "grid w-full",
        gridColsClass || "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
        gapClass,
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
