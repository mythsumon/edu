import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { FormField } from "./FormField";
import {
  CustomDropdownField,
  DropdownOption,
} from "@/shared/components/CustomDropdown";

interface FormDropdownFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
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
  searchPlaceholder,
  emptyMessage,
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
        render={({ field }) => (
          <CustomDropdownField
            id={id}
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            options={options}
            disabled={disabled}
            hasError={!!error}
          />
        )}
      />
    </FormField>
  );
};
