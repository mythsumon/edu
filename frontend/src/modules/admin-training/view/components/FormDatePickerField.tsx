import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { FormField } from "./FormField";
import { CustomDateInput } from "@/shared/components/CustomDateInput";

interface FormDatePickerFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTodayButton?: boolean;
}

export const FormDatePickerField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  showTodayButton = true,
}: FormDatePickerFieldProps<TFieldValues>) => {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <CustomDateInput
            id={id}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!error}
            minDate={minDate}
            maxDate={maxDate}
            showTodayButton={showTodayButton}
          />
        )}
      />
    </FormField>
  );
};
