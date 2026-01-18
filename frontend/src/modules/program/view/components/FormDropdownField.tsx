import { Control, Controller, FieldError, FieldValues, Path } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { FormField } from "./FormField";
import { cn } from "@/shared/lib/cn";

interface DropdownOption {
  value: string;
  label: string;
}

interface FormDropdownFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  options: DropdownOption[];
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}

export const FormDropdownField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  options,
  error,
  required = false,
  disabled = false,
}: FormDropdownFieldProps<TFieldValues>) => {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedOption = options.find(
            (opt) => opt.value === field.value
          );

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-10 rounded-xl border bg-secondary/40 px-3 py-2 text-sm md:text-xs ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 ease-in-out",
                    error ? "ring-2 ring-destructive" : "",
                    !field.value ? "text-muted-foreground" : ""
                  )}
                  disabled={disabled}
                >
                  <span
                    className={cn(
                      "truncate text-xs",
                      field.value
                        ? "font-normal"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {selectedOption ? selectedOption.label : placeholder}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 border-secondary rounded-xl space-y-1"
              >
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "cursor-pointer rounded-lg",
                      field.value === option.value && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 text-sm md:text-xs",
                        field.value === option.value &&
                          "text-primary"
                      )}
                    >
                      {option.label}
                    </span>
                    {field.value === option.value && (
                      <Check
                        className="h-3 w-3 text-primary"
                        strokeWidth={3}
                      />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }}
      />
    </FormField>
  );
};
