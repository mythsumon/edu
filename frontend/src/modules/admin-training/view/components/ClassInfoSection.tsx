import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { FieldArrayWithId } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown, Download, Upload, X, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { FormField } from "./FormField";
import { PeriodCard } from "./PeriodCard";
import { CreateAdminTrainingFormData } from "../../model/admin-training.schema";
import { downloadClassTemplate } from "../../model/admin-training.service";
import { cn } from "@/shared/lib/cn";
import { convertToISODate } from "@/shared/lib/date";

/**
 * Parsed CSV row data
 */
interface ParsedClassRow {
  periodClasses: string;
  date: string;
  startTime: string;
  endTime: string;
  mainInstructor: string;
  assistantInstructor: string;
}

/**
 * Validation errors for a single row (true = error, false = valid)
 */
interface RowValidationErrors {
  periodClasses: boolean;
  date: boolean;
  startTime: boolean;
  endTime: boolean;
  mainInstructor: boolean;
  assistantInstructor: boolean;
}

/**
 * Column keys for validation
 */
type ColumnKey = keyof ParsedClassRow;

/**
 * Validate if value is a positive integer (or empty)
 */
const isValidPositiveInteger = (value: string): boolean => {
  if (value.trim() === "") return true; // Empty is valid (optional)
  const num = parseInt(value, 10);
  return !isNaN(num) && num > 0 && String(num) === value.trim();
};

/**
 * Parse date string to Date object
 * Returns null if invalid
 */
const parseDateString = (value: string): Date | null => {
  if (!value || value.trim() === "") return null;
  const trimmed = value.trim();
  
  // Try parsing M/D/YYYY or MM/DD/YYYY format
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }
  
  // Try parsing MMDDYYYY format
  const numericMatch = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (numericMatch) {
    const [, month, day, year] = numericMatch;
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }
  
  // Try parsing ISO format YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
      return new Date(y, m - 1, d);
    }
  }
  
  return null;
};

/**
 * Validate date format and optionally check if within range
 * Accepts: M/D/YYYY, MM/DD/YYYY, MMDDYYYY, YYYY-MM-DD
 */
const isValidDateInRange = (
  value: string,
  startDate?: Date,
  endDate?: Date
): boolean => {
  if (value.trim() === "") return true; // Empty is valid
  
  const date = parseDateString(value);
  if (date === null) return false; // Invalid format
  
  // If no range specified, just validate format
  if (!startDate && !endDate) return true;
  
  // Check if date is within range
  // Set time to midnight for accurate date comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (startDate) {
    const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (dateOnly < startOnly) return false;
  }
  
  if (endDate) {
    const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    if (dateOnly > endOnly) return false;
  }
  
  return true;
};

/**
 * Validate time in 24-hour format (HH:MM or H:MM)
 */
const isValidTime24 = (value: string): boolean => {
  if (value.trim() === "") return true; // Empty is valid
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const [, hours, minutes] = match;
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
};

/**
 * Validate a single row and return validation errors
 * Optionally validates date is within startDate and endDate range
 */
const validateRow = (
  row: ParsedClassRow,
  startDate?: Date,
  endDate?: Date
): RowValidationErrors => {
  return {
    periodClasses: !isValidPositiveInteger(row.periodClasses),
    date: !isValidDateInRange(row.date, startDate, endDate),
    startTime: !isValidTime24(row.startTime),
    endTime: !isValidTime24(row.endTime),
    mainInstructor: !isValidPositiveInteger(row.mainInstructor),
    assistantInstructor: !isValidPositiveInteger(row.assistantInstructor),
  };
};

/**
 * Expected header columns for validation (Korean)
 */
const EXPECTED_HEADERS = [
  "차시 수업",
  "일자",
  "시작시간",
  "종료시간",
  "필요 주강사 수",
  "필요 보조강사 수",
];

/**
 * Validate that the CSV has the expected header columns
 */
const isValidTemplateHeader = (headerLine: string): boolean => {
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());
  const expectedLower = EXPECTED_HEADERS.map((h) => h.toLowerCase());
  
  // Check if all expected headers are present in the correct order
  if (headers.length < expectedLower.length) return false;
  
  for (let i = 0; i < expectedLower.length; i++) {
    if (headers[i] !== expectedLower[i]) return false;
  }
  
  return true;
};

/**
 * Parse CSV content into rows
 * Returns null if the template is invalid
 */
const parseCSV = (content: string): ParsedClassRow[] | null => {
  const lines = content.split(/\r?\n/);
  
  // Check if file has at least a header row
  if (lines.length === 0) return null;
  
  // Validate header row
  const headerLine = lines[0]?.trim() || "";
  if (!isValidTemplateHeader(headerLine)) {
    return null; // Invalid template
  }
  
  const rows: ParsedClassRow[] = [];
  
  // Skip header row (first line)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue; // Skip empty lines
    
    const cells = line.split(",");
    rows.push({
      periodClasses: cells[0]?.trim() || "",
      date: cells[1]?.trim() || "",
      startTime: cells[2]?.trim() || "",
      endTime: cells[3]?.trim() || "",
      mainInstructor: cells[4]?.trim() || "",
      assistantInstructor: cells[5]?.trim() || "",
    });
  }
  
  return rows;
};

/**
 * Validate Excel header row
 */
const isValidExcelHeader = (headers: (string | undefined)[]): boolean => {
  const expectedLower = EXPECTED_HEADERS.map((h) => h.toLowerCase());
  
  if (headers.length < expectedLower.length) return false;
  
  for (let i = 0; i < expectedLower.length; i++) {
    const header = headers[i]?.toString().trim().toLowerCase() || "";
    if (header !== expectedLower[i]) return false;
  }
  
  return true;
};

/**
 * Parse Excel (xlsx/xls) content into rows
 * Returns null if the template is invalid
 */
const parseExcel = (data: ArrayBuffer): ParsedClassRow[] | null => {
  try {
    const workbook = XLSX.read(data, { type: "array" });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return null;
    
    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) return null;
    
    // Convert to array of arrays
    const jsonData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false, // Get formatted strings
      defval: "",
    });
    
    // Check if file has at least a header row
    if (jsonData.length === 0) return null;
    
    // Validate header row
    const headerRow = jsonData[0]?.map((cell) => cell?.toString() || "") || [];
    if (!isValidExcelHeader(headerRow)) {
      return null; // Invalid template
    }
    
    const rows: ParsedClassRow[] = [];
    
    // Skip header row (first row)
    for (let i = 1; i < jsonData.length; i++) {
      const rowData = jsonData[i];
      if (!rowData || rowData.every((cell) => !cell || cell.toString().trim() === "")) {
        continue; // Skip empty rows
      }
      
      rows.push({
        periodClasses: rowData[0]?.toString().trim() || "",
        date: rowData[1]?.toString().trim() || "",
        startTime: rowData[2]?.toString().trim() || "",
        endTime: rowData[3]?.toString().trim() || "",
        mainInstructor: rowData[4]?.toString().trim() || "",
        assistantInstructor: rowData[5]?.toString().trim() || "",
      });
    }
    
    return rows;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return null;
  }
};

/**
 * Period data structure for form
 */
interface PeriodFormData {
  date: string;
  startTime: string;
  endTime: string;
  mainLecturers: number;
  assistantLecturers: number;
}

interface ClassInfoSectionProps {
  control: Control<CreateAdminTrainingFormData>;
  register: UseFormRegister<CreateAdminTrainingFormData>;
  watch: UseFormWatch<CreateAdminTrainingFormData>;
  errors: FieldErrors<CreateAdminTrainingFormData>;
  isSubmitting: boolean;
  fields: FieldArrayWithId<CreateAdminTrainingFormData, "periods", "id">[];
  onPeriodsImported?: (periods: PeriodFormData[], numberOfPeriods: number) => void;
  onValidationChange?: (hasErrors: boolean) => void;
}

export const ClassInfoSection = ({
  control,
  register,
  watch,
  errors,
  isSubmitting,
  fields,
  onPeriodsImported,
  onValidationChange,
}: ClassInfoSectionProps) => {
  const { t } = useTranslation();

  // Internal state for collapsible section
  const [isOpen, setIsOpen] = useState(true);

  // Internal state for period collapse
  const [openPeriods, setOpenPeriods] = useState<Record<number, boolean>>({});

  // State for template download
  const [isDownloading, setIsDownloading] = useState(false);

  // State for CSV upload and parsing
  const [uploadedRows, setUploadedRows] = useState<ParsedClassRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<RowValidationErrors[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch and compute values internally
  const numberOfPeriodsValue = watch("numberOfPeriods");
  const periodCount = useMemo(() => {
    if (!numberOfPeriodsValue || numberOfPeriodsValue < 1) return 0;
    return Math.min(numberOfPeriodsValue, 100); // Cap at 100 for safety
  }, [numberOfPeriodsValue]);

  const startDateValue = watch("startDate");
  const startDateAsDate = useMemo(() => {
    if (!startDateValue || startDateValue.trim() === "") return undefined;
    const date = new Date(startDateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }, [startDateValue]);

  const endDateValue = watch("endDate");
  const endDateAsDate = useMemo(() => {
    if (!endDateValue || endDateValue.trim() === "") return undefined;
    const date = new Date(endDateValue);
    return isNaN(date.getTime()) ? undefined : date;
  }, [endDateValue]);

  // Toggle individual period
  const togglePeriod = useCallback((periodIndex: number) => {
    setOpenPeriods((prev) => ({
      ...prev,
      [periodIndex]: !prev[periodIndex],
    }));
  }, []);

  // Check if all periods are expanded
  const areAllPeriodsExpanded = useMemo(() => {
    if (periodCount === 0) return false;
    return Array.from({ length: periodCount }, (_, i) => i).every(
      (index) => openPeriods[index] === true
    );
  }, [openPeriods, periodCount]);

  // Toggle all periods
  const toggleAllPeriods = useCallback(() => {
    const newState = !areAllPeriodsExpanded;
    const newOpenPeriods: Record<number, boolean> = {};
    for (let i = 0; i < periodCount; i++) {
      newOpenPeriods[i] = newState;
    }
    setOpenPeriods(newOpenPeriods);
  }, [areAllPeriodsExpanded, periodCount]);

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = useCallback((n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }, []);

  // Handle template download
  const handleDownloadTemplate = useCallback(async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      const blob = await downloadClassTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "class_template.csv";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  // State for invalid template error
  const [templateError, setTemplateError] = useState<string | null>(null);

  // State for uploaded file name
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Process uploaded file
  // Convert imported rows to form periods
  const convertRowsToFormPeriods = useCallback((rows: ParsedClassRow[]): PeriodFormData[] => {
    return rows.map((row) => ({
      date: convertToISODate(row.date || ""),
      startTime: row.startTime || "",
      endTime: row.endTime || "",
      mainLecturers: row.mainInstructor ? parseInt(row.mainInstructor, 10) || 0 : 0,
      assistantLecturers: row.assistantInstructor ? parseInt(row.assistantInstructor, 10) || 0 : 0,
    }));
  }, []);

  const processFile = useCallback((file: File) => {
    // Clear previous error and file name
    setTemplateError(null);
    setUploadedFileName(null);

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      setTemplateError(t("training.invalidFileType"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      let rows: ParsedClassRow[] | null = null;

      if (isCSV) {
        // Parse CSV as text
        const content = result as string;
        rows = parseCSV(content);
      } else if (isExcel) {
        // Parse Excel as ArrayBuffer
        const data = result as ArrayBuffer;
        rows = parseExcel(data);
      }

      if (rows === null) {
        // Invalid template - headers don't match or parsing failed
        setTemplateError(t("training.invalidTemplateFormat"));
        setUploadedRows([]);
        setValidationErrors([]);
        return;
      }

      const errors = rows.map((row) => validateRow(row, startDateAsDate, endDateAsDate));
      setUploadedRows(rows);
      setValidationErrors(errors);
      setUploadedFileName(file.name); // Store file name on success

      // Convert and pass data to parent form only if no validation errors
      const hasErrors = errors.some((err) => Object.values(err).some((v) => v));
      if (onPeriodsImported && rows.length > 0 && !hasErrors) {
        const formPeriods = convertRowsToFormPeriods(rows);
        onPeriodsImported(formPeriods, rows.length);
      }
    };
    reader.onerror = () => {
      setTemplateError(t("training.fileReadError"));
    };

    // Read file based on type
    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [t, onPeriodsImported, convertRowsToFormPeriods, startDateAsDate, endDateAsDate]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [processFile]);

  // Handle click on upload area
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Clear uploaded data
  const handleClearUpload = useCallback(() => {
    setUploadedRows([]);
    setValidationErrors([]);
    setTemplateError(null);
    setUploadedFileName(null);
  }, []);

  // Check if cell has error
  const hasCellError = useCallback((rowIndex: number, column: ColumnKey): boolean => {
    return validationErrors[rowIndex]?.[column] ?? false;
  }, [validationErrors]);

  // Check if any row has any error
  const hasAnyError = useMemo(() => {
    return validationErrors.some((row) =>
      Object.values(row).some((hasError) => hasError)
    );
  }, [validationErrors]);

  // Check if any row has a date error (for showing specific date range message)
  const hasDateError = useMemo(() => {
    return validationErrors.some((row) => row.date);
  }, [validationErrors]);

  // Notify parent when validation state changes (only when there are uploaded rows)
  useEffect(() => {
    if (onValidationChange && uploadedRows.length > 0) {
      onValidationChange(hasAnyError);
    }
  }, [hasAnyError, uploadedRows.length, onValidationChange]);

  // Column headers for the table
  const columnHeaders: { key: ColumnKey; label: string }[] = [
    { key: "periodClasses", label: t("training.periodClasses") },
    { key: "date", label: t("training.date") },
    { key: "startTime", label: t("training.startTime") },
    { key: "endTime", label: t("training.endTime") },
    { key: "mainInstructor", label: t("training.mainInstructor") },
    { key: "assistantInstructor", label: t("training.assistantInstructor") },
  ];

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full md:w-[600px] lg:w-[700px] xl:w-[800px]"
    >
      <Card>
        <div className="px-4">
          <div className="flex flex-row justify-between items-start">
            <h2 className="text-lg font-medium">
              {t("training.classInformation")}
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
                <span className="sr-only">
                  {isOpen ? t("common.collapse") : t("common.expand")}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("training.classInformationDescription")}
          </p>
        </div>
        <div className="mx-4 mt-4 p-4 rounded-lg flex items-center bg-muted/60 justify-between">
          <div>
            <p className="text-sm font-medium">{t("training.downloadExcelTemplate")}</p>
            <p className="text-xs text-muted-foreground">
              {t("training.downloadExcelTemplateDescription")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? t("common.downloading") : t("training.downloadTemplate")}
          </Button>
        </div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {/* Conditional: Show drop zone OR uploaded file info */}
        {uploadedFileName ? (
          /* Uploaded file info */
          <div className="mx-4 mt-2 p-4 border border-muted-foreground/25 rounded-lg flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{uploadedFileName}</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedRows.length} {t("training.rowsImported")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearUpload}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Upload drop zone */
          <div
            className={cn(
              "mx-4 mt-2 p-8 border border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-6 w-6 text-muted-foreground/80 mb-4" />
            <p className="text-sm">
              <span className="text-primary font-medium">{t("training.clickToSelectFiles")}</span>
              <span className="text-muted-foreground"> {t("training.orDragAndDrop")}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("training.supportedFileTypes")}
            </p>
          </div>
        )}

        {/* Template error message */}
        {templateError && (
          <div className="mx-4 mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center justify-between">
            <p className="text-sm text-destructive">{templateError}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTemplateError(null)}
              className="text-xs text-destructive hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <CollapsibleContent className="px-4">
          <div className="pt-2 space-y-4">
            {/* Show table view when file is uploaded, otherwise show period cards */}
            {uploadedFileName && uploadedRows.length > 0 ? (
              /* Uploaded data table view */
              <div className="mt-2">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        {columnHeaders.map((col) => (
                          <TableHead key={col.key} className="text-xs">
                            {col.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedRows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {rowIndex + 1}
                          </TableCell>
                          {columnHeaders.map((col) => (
                            <TableCell
                              key={col.key}
                              className={cn(
                                "text-xs",
                                hasCellError(rowIndex, col.key) &&
                                  "border-2 border-destructive bg-destructive/5"
                              )}
                            >
                              {row[col.key] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Validation error message below table */}
                {hasAnyError && (
                  <div className="text-xs text-destructive mt-2 space-y-1">
                    <p>{t("training.errorFoundInColumn")}</p>
                    {hasDateError && (startDateAsDate || endDateAsDate) && (
                      <p>{t("training.dateOutOfRangeError")}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Manual entry: Number of periods input and period cards */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="numberOfPeriods"
                    label={t("training.numberOfPeriodsLabel")}
                    required
                    error={errors.numberOfPeriods}
                  >
                    <input
                      id="numberOfPeriods"
                      type="number"
                      min={1}
                      max={100}
                      placeholder={t("training.numberOfPeriodsPlaceholder")}
                      {...register("numberOfPeriods", {
                        valueAsNumber: true,
                      })}
                      className={cn(
                        "flex h-10 w-full rounded-xl border bg-secondary/40 px-3 py-2 text-sm ring-offset-0 placeholder:text-muted-foreground/60 placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:text-xs transition-all duration-200 ease-in-out",
                        errors.numberOfPeriods && "ring-2 ring-destructive"
                      )}
                    />
                  </FormField>
                </div>

                {/* Dynamic Period Cards */}
                {periodCount > 0 && (
                  <div className="space-y-3 mt-4 px-0 rounded-xl">
                    {/* Periods Header with Expand/Collapse All Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">{t("training.periodsClass")}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleAllPeriods}
                        className="text-xs hover:bg-muted/70"
                      >
                        {areAllPeriodsExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            {t("common.collapseAll")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            {t("common.expandAll")}
                          </>
                        )}
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <PeriodCard
                        key={field.id}
                        index={index}
                        isOpen={openPeriods[index] ?? false}
                        onToggle={() => togglePeriod(index)}
                        control={control}
                        register={register}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        minDate={startDateAsDate}
                        maxDate={endDateAsDate}
                        getOrdinalSuffix={getOrdinalSuffix}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
