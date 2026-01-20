import { useState, useMemo, useCallback } from "react";
import { Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { FieldArrayWithId } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shared/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { FormField } from "./FormField";
import { PeriodCard } from "./PeriodCard";
import { CreateAdminTrainingFormData } from "../../model/admin-training.schema";

interface ClassInfoSectionProps {
  control: Control<CreateAdminTrainingFormData>;
  register: UseFormRegister<CreateAdminTrainingFormData>;
  watch: UseFormWatch<CreateAdminTrainingFormData>;
  errors: FieldErrors<CreateAdminTrainingFormData>;
  isSubmitting: boolean;
  fields: FieldArrayWithId<CreateAdminTrainingFormData, "periods", "id">[];
}

export const ClassInfoSection = ({
  control,
  register,
  watch,
  errors,
  isSubmitting,
  fields,
}: ClassInfoSectionProps) => {
  const { t } = useTranslation();

  // Internal state for collapsible section
  const [isOpen, setIsOpen] = useState(true);

  // Internal state for tab selection
  const [activeTab, setActiveTab] = useState<"manual" | "excel">("manual");

  // Internal state for period collapse
  const [openPeriods, setOpenPeriods] = useState<Record<number, boolean>>({});

  // Watch and compute values internally
  const numberOfClassesValue = watch("numberOfClasses");
  const periodCount = useMemo(() => {
    if (!numberOfClassesValue || numberOfClassesValue < 1) return 0;
    return Math.min(numberOfClassesValue, 100); // Cap at 100 for safety
  }, [numberOfClassesValue]);

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

  // Tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "manual" | "excel");
  }, []);

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
        <CollapsibleContent className="px-4">
          <div className="pb-4">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full p-1"
            >
              <TabsList className="relative grid w-full grid-cols-2 h-12 p-1 bg-muted/60 rounded-md">
                {/* Sliding indicator */}
                <div
                  className="absolute h-10 rounded-md bg-background shadow transition-all duration-300 ease-in-out bg-badge"
                  style={{
                    width: "calc(50% - 4px)",
                    left: activeTab === "manual" ? "4px" : "calc(50% + 2px)",
                  }}
                />
                <TabsTrigger
                  value="manual"
                  className="font-normal text-sm md:text-sm relative z-10 h-10 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors duration-300"
                >
                  {t("training.manualTab")}
                </TabsTrigger>
                <TabsTrigger
                  value="excel"
                  className="font-normal text-sm md:text-sm relative z-10 h-10 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none transition-colors duration-300"
                >
                  {t("training.excelTab")}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="manual"
                className="animate-in fade-in-0 slide-in-from-left-2 duration-300"
              >
                <div className="pt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="numberOfClasses"
                      label={t("training.numberOfClassesLabel")}
                      required
                      error={errors.numberOfClasses}
                    >
                      <Input
                        id="numberOfClasses"
                        type="number"
                        placeholder={t("training.numberOfClassesPlaceholder")}
                        {...register("numberOfClasses", {
                          valueAsNumber: true,
                        })}
                        className={
                          errors.numberOfClasses
                            ? "ring-2 ring-destructive"
                            : ""
                        }
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>

                  {/* Dynamic Period Cards */}
                  {periodCount > 0 && (
                    <div className="space-y-3 mt-4 px-2 rounded-xl">
                      {/* Expand/Collapse All Button */}
                      <div className="flex justify-end">
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
                </div>
              </TabsContent>
              <TabsContent
                value="excel"
                className="animate-in fade-in-0 slide-in-from-right-2 duration-300"
              >
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("training.excelTabDescription")}
                  </p>
                  <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                    <p className="text-muted-foreground">
                      {t("training.excelTabPlaceholder")}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
