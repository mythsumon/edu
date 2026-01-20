import { Clock } from "lucide-react";
import { Input } from "@/shared/ui/input";

interface CustomTimeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const CustomTimeInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  hasError = false,
}: CustomTimeInputProps) => {
  return (
    <div className="relative w-full">
      <Input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-10 w-full rounded-xl border bg-secondary/40 px-3 py-2 pr-10 text-sm md:text-xs font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out ${
          hasError ? "ring-2 ring-destructive" : ""
        } ${!value ? "text-muted-foreground/60" : ""}`}
      />
      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};
