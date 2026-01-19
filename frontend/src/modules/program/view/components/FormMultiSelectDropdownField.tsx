import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";
import { FormField } from "./FormField";
import {
  CustomMultiSelectDropdown,
  MultiSelectOption,
} from "@/shared/components/CustomMultiSelectDropdown";

interface FormMultiSelectDropdownFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  options: MultiSelectOption[];
  error?: FieldError | FieldErrors<TFieldValues[Path<TFieldValues>]>;
  required?: boolean;
  disabled?: boolean;
  showSelectAll?: boolean;
}

export const FormMultiSelectDropdownField = <
  TFieldValues extends FieldValues,
>({
  id,
  name,
  label,
  placeholder,
  control,
  options,
  error,
  required = false,
  disabled = false,
  showSelectAll = true,
}: FormMultiSelectDropdownFieldProps<TFieldValues>) => {
  // Handle array field errors - extract first error if it's an array
  const fieldError = Array.isArray(error) ? error[0] : error;

  return (
    <FormField id={id} label={label} required={required} error={fieldError}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <CustomMultiSelectDropdown
            id={id}
            value={Array.isArray(field.value) ? (field.value as string[]) : []}
            onChange={field.onChange}
            placeholder={placeholder}
            options={options}
            disabled={disabled}
            hasError={!!error}
            showSelectAll={showSelectAll}
          />
        )}
      />
    </FormField>
  );
};
