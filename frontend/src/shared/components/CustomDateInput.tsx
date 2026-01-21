import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatDateDot } from "@/shared/lib/date";

interface CustomDateInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTodayButton?: boolean;
}

/**
 * Converts a Date object to YYYY-MM-DD string format
 */
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parses a date string to Date object, returns undefined if invalid
 */
const parseDate = (value: string): Date | undefined => {
  if (!value || value.trim() === "") return undefined;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined;
    return date;
  } catch {
    return undefined;
  }
};

export const CustomDateInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  hasError = false,
  minDate,
  maxDate,
  showTodayButton = true,
}: CustomDateInputProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const date = parseDate(value);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(formatDateToString(selectedDate));
    } else {
      onChange("");
    }
    setDatePickerOpen(false);
  };

  const handleSelectToday = (todayDate: Date) => {
    onChange(formatDateToString(todayDate));
    setDatePickerOpen(false);
  };

  return (
    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            type="button"
            variant="ghost"
            id={id}
            className={`h-10 w-full rounded-xl border bg-secondary/40 px-3 py-2 pr-3 text-sm md:text-xs text-left justify-between font-normal hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out ${
              hasError ? "ring-2 ring-destructive" : ""
            } ${!date ? "text-muted-foreground/60" : ""}`}
            disabled={disabled}
            onBlur={onBlur}
          >
            <span className="flex-1 text-left">
              {date ? formatDateDot(date) : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0 rounded-xl border-border/50 shadow-sm"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={handleSelect}
          onSelectToday={handleSelectToday}
          showTodayButton={showTodayButton}
          disabled={
            minDate || maxDate
              ? {
                  ...(minDate && { before: minDate }),
                  ...(maxDate && { after: maxDate }),
                }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
};
