import * as React from "react";
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
import { cn } from "@/shared/lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface SelectAllCheckboxItemProps {
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

const SelectAllCheckboxItem: React.FC<SelectAllCheckboxItemProps> = ({
  allSelected,
  someSelected,
  onSelectAll,
}) => {
  const { t } = useTranslation();
  const checkboxRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
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

export interface CustomMultiSelectDropdownProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  options: MultiSelectOption[];
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  showSelectAll?: boolean;
}

export const CustomMultiSelectDropdown: React.FC<
  CustomMultiSelectDropdownProps
> = ({
  id,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
  hasError = false,
  className,
  showSelectAll = true,
}) => {
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  const handleCheckedChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, optionValue]);
    } else {
      onChange(selectedValues.filter((v) => v !== optionValue));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allValues = options.map((opt) => opt.value);
      onChange(allValues);
    } else {
      onChange([]);
    }
  };

  const allSelected =
    selectedValues.length === options.length && options.length > 0;
  const someSelected =
    selectedValues.length > 0 && selectedValues.length < options.length;

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
            hasError ? "ring-2 ring-destructive" : "",
            selectedValues.length === 0 ? "text-muted-foreground" : "",
            className
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
        {showSelectAll && (
          <>
            <SelectAllCheckboxItem
              allSelected={allSelected}
              someSelected={someSelected}
              onSelectAll={handleSelectAll}
            />
            <DropdownMenuSeparator />
          </>
        )}
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
};
