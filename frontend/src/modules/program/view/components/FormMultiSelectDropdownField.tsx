import { Control, Controller, FieldError, FieldErrors, FieldValues, Path } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Checkbox } from "@/shared/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { FormField } from "./FormField";
import { cn } from "@/shared/lib/cn";
import { useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface SelectAllCheckboxItemProps {
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

const SelectAllCheckboxItem = ({
  allSelected,
  someSelected,
  onSelectAll,
}: SelectAllCheckboxItemProps) => {
  const { t } = useTranslation();
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      const checkboxElement = checkboxRef.current as HTMLButtonElement & {
        indeterminate?: boolean;
      };
      checkboxElement.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        onSelectAll(!allSelected);
      }}
      className={cn(
        "cursor-pointer rounded-lg pl-2 pr-2",
        allSelected && "bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <Checkbox
          ref={checkboxRef}
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        <span
          className={cn(
            "flex-1 text-sm md:text-xs font-medium",
            allSelected && "text-primary"
          )}
        >
          {t("common.selectAll")}
        </span>
      </div>
    </DropdownMenuItem>
  );
};

interface FormMultiSelectDropdownFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  options: DropdownOption[];
  error?: FieldError | FieldErrors<TFieldValues[Path<TFieldValues>]>;
  required?: boolean;
  disabled?: boolean;
}

export const FormMultiSelectDropdownField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  options,
  error,
  required = false,
  disabled = false,
}: FormMultiSelectDropdownFieldProps<TFieldValues>) => {
  // Handle array field errors - extract first error if it's an array
  const fieldError = Array.isArray(error) ? error[0] : error;

  return (
    <FormField id={id} label={label} required={required} error={fieldError}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedValues: string[] = Array.isArray(field.value) 
            ? (field.value as string[]) 
            : [];
          const selectedOptions = options.filter((opt) =>
            selectedValues.includes(opt.value)
          );

          const handleCheckedChange = (optionValue: string, checked: boolean) => {
            const currentValues: string[] = Array.isArray(field.value) 
              ? (field.value as string[]) 
              : [];
            if (checked) {
              field.onChange([...currentValues, optionValue]);
            } else {
              field.onChange(currentValues.filter((v) => v !== optionValue));
            }
          };

          const handleSelectAll = (checked: boolean) => {
            if (checked) {
              // Select all options
              const allValues = options.map((opt) => opt.value);
              field.onChange(allValues);
            } else {
              // Deselect all options
              field.onChange([]);
            }
          };

          const allSelected = selectedValues.length === options.length && options.length > 0;
          const someSelected = selectedValues.length > 0 && selectedValues.length < options.length;

          const displayText =
            selectedOptions.length === 0
              ? placeholder
              : selectedOptions.length === 1
              ? selectedOptions[0].label
              : `${selectedOptions.length} selected`;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-10 rounded-xl border bg-secondary/40 px-3 py-2 text-sm md:text-xs ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 ease-in-out",
                    error ? "ring-2 ring-destructive" : "",
                    selectedValues.length === 0 ? "text-muted-foreground" : ""
                  )}
                  disabled={disabled}
                >
                  <span
                    className={cn(
                      "truncate text-xs",
                      selectedValues.length > 0
                        ? "font-normal"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {displayText}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 border-secondary rounded-xl space-y-1"
              >
                {/* Select All Option */}
                <SelectAllCheckboxItem
                  allSelected={allSelected}
                  someSelected={someSelected}
                  onSelectAll={handleSelectAll}
                />
                <DropdownMenuSeparator />
                {options.map((option) => {
                  const isChecked = selectedValues.includes(option.value);
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={(e) => {
                        e.preventDefault();
                        handleCheckedChange(option.value, !isChecked);
                      }}
                      className={cn(
                        "cursor-pointer rounded-lg pl-2 pr-2",
                        isChecked && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCheckedChange(option.value, checked as boolean)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                        <span
                          className={cn(
                            "flex-1 text-sm md:text-xs",
                            isChecked && "text-primary"
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }}
      />
    </FormField>
  );
};
