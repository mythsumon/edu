import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/cn";

interface CustomTimeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

/**
 * Formats time value for display (HH:MM format)
 */
const formatTimeDisplay = (value: string): string => {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  if (!hours || !minutes) return value;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

/**
 * Generates hour options (00-23)
 */
const generateHours = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
};

/**
 * Generates minute options (00-59)
 */
const generateMinutes = (): string[] => {
  return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
};

export const CustomTimeInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  hasError = false,
}: CustomTimeInputProps) => {
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const hours = useMemo(() => generateHours(), []);
  const minutes = useMemo(() => generateMinutes(), []);

  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!value) return ["", ""];
    const parts = value.split(":");
    return [parts[0] || "", parts[1] || ""];
  }, [value]);

  const handleHourSelect = (hour: string) => {
    const newMinute = selectedMinute || "00";
    onChange(`${hour}:${newMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    const newHour = selectedHour || "00";
    onChange(`${newHour}:${minute}`);
  };

  const handleNowClick = () => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    onChange(`${hour}:${minute}`);
    setTimePickerOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setTimePickerOpen(false);
  };

  return (
    <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Button
            type="button"
            variant="ghost"
            id={id}
            className={`h-10 w-full rounded-xl border bg-secondary/40 px-3 py-2 pr-3 text-sm md:text-xs text-left justify-between font-normal hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out ${
              hasError ? "ring-2 ring-destructive" : ""
            } ${!value ? "text-muted-foreground/60" : ""}`}
            disabled={disabled}
            onBlur={onBlur}
          >
            <span className="flex-1 text-left">
              {value ? formatTimeDisplay(value) : placeholder}
            </span>
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[180px] overflow-hidden p-0 rounded-xl border-border/50 shadow-sm"
        align="start"
      >
        <div className="flex flex-col">
          <div className="flex">
            {/* Hours Column */}
            <div className="flex flex-col border-r border-border/50">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 text-center">
                Hour
              </div>
              <div className="h-48 overflow-y-auto scrollbar-thin">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "w-full px-8 py-1.5 text-sm hover:bg-muted transition-colors",
                      selectedHour === hour &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
            {/* Minutes Column */}
            <div className="flex flex-col">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/50 text-center">
                Minute
              </div>
              <div className="h-48 overflow-y-auto scrollbar-thin">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={cn(
                      "w-full px-4 py-1.5 text-sm hover:bg-muted transition-colors",
                      selectedMinute === minute &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col border-t border-border/50 p-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNowClick}
              className="text-xs h-8 w-full"
            >
              Now
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs h-8 w-full"
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
