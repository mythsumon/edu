import * as React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export interface CustomPaginationProps {
  /**
   * Total number of items across all pages
   */
  total: number;
  /**
   * Current page index (0-based)
   */
  page: number;
  /**
   * Number of items per page
   */
  size: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Callback when page size changes
   */
  onSizeChange?: (size: number) => void;
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Whether to show the results count text
   * @default true
   */
  showResultsCount?: boolean;
}

/**
 * CustomPagination Component
 *
 * A reusable pagination component built on top of shadcn pagination.
 * Displays page navigation controls with intelligent page number display
 * and optional results count text.
 *
 * @example
 * ```tsx
 * <CustomPagination
 *   total={100}
 *   page={0}
 *   size={20}
 *   totalPages={5}
 *   onPageChange={(newPage) => setPage(newPage)}
 * />
 * ```
 */
export const CustomPagination: React.FC<CustomPaginationProps> = ({
  total,
  page,
  size,
  totalPages,
  onPageChange,
  onSizeChange,
  className,
  showResultsCount = true,
}) => {
  const { t } = useTranslation();

  // Don't render if no pages
  if (totalPages === 0) {
    return null;
  }

  // Calculate display range
  const currentItem = total === 0 ? 0 : Math.min((page + 1) * size, total);

  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const currentPage = page;

    // Always show first page
    pages.push(0);

    // Determine which pages to show
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages intelligently
      if (currentPage <= 2) {
        // Near the start: 1, 2, 3, ..., last
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        // Near the end: 1, ..., last-3, last-2, last-1, last
        pages.push("ellipsis");
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle: 1, ..., current-1, current, current+1, ..., last
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage);
    }
  };

  const handleSizeChange = (newSize: number) => {
    if (onSizeChange) {
      onSizeChange(newSize);
      // Reset to first page when size changes
      onPageChange(0);
    }
  };

  const pageSizeOptions = [10, 20, 50, 100];

  const pages = getPageNumbers();
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;

  return (
    <div className={`px-3 py-2 ${className || ""}`}>
      <Pagination className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showResultsCount && (
            <p className="text-sm md:text-xs text-muted-foreground">
              {t("common.paginationInfo", {
                current: currentItem,
                total: total,
                defaultValue: `Showing ${currentItem} of ${total} total results`,
              })}
            </p>
          )}
          {onSizeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-20 justify-between rounded-xl border bg-secondary/40 px-3 py-2 text-xs ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 ease-in-out"
                  )}
                >
                  <span className="truncate text-xs font-normal">{size}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 border-secondary rounded-xl space-y-1"
              >
                {pageSizeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleSizeChange(option)}
                    className={cn(
                      "cursor-pointer rounded-lg pl-2 pr-2",
                      size === option && "bg-badge"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span
                        className={cn(
                          "flex-1 text-xs",
                          size === option && "text-primary font-semibold"
                        )}
                      >
                        {option}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <PaginationContent className="flex">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(page - 1)}
              disabled={isFirstPage}
            />
          </PaginationItem>
          {pages.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === page}
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              disabled={isLastPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
