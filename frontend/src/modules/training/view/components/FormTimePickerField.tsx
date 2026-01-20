import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { FormField } from "./FormField";
import { CustomTimeInput } from "@/shared/components/CustomTimeInput";

interface FormTimePickerFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}

export const FormTimePickerField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  error,
  required = false,
  disabled = false,
}: FormTimePickerFieldProps<TFieldValues>) => {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <CustomTimeInput
            id={id}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!error}
          />
        )}
      />
    </FormField>
  );
};
