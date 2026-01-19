import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface CustomDropdownFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options: DropdownOption[];
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

export const CustomDropdownField: React.FC<CustomDropdownFieldProps> = ({
  id,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  disabled = false,
  hasError = false,
  className,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const resolvedEmptyMessage = emptyMessage ?? t("common.noResultsFound");

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 rounded-xl border bg-secondary/40 px-3 py-2 text-sm md:text-xs ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 ease-in-out",
            hasError ? "ring-2 ring-destructive" : "",
            !value ? "text-muted-foreground" : "",
            className
          )}
          disabled={disabled}
        >
          <span
            className={cn(
              "truncate text-xs",
              value ? "font-normal" : "text-muted-foreground/60"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 border-secondary rounded-xl"
        align="start"
      >
        <Command value="" onValueChange={() => {}}>
          <CommandInput
            placeholder={resolvedSearchPlaceholder}
            className="text-xs"
          />
          <CommandList className="px-1 py-2">
            <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 mb-2",
                    value === option.value && "bg-badge"
                  )}
                >
                  <span
                    className={cn(
                      "flex-1 text-sm md:text-xs",
                      value === option.value && "text-primary"
                    )}
                  >
                    {option.label}
                  </span>
                  <Check
                    className={cn(
                      "h-3 w-3",
                      value === option.value
                        ? "opacity-100 text-primary"
                        : "opacity-0"
                    )}
                    strokeWidth={3}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
