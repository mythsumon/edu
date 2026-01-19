import { Control, Controller, FieldError, FieldErrors, FieldValues, Path } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { FormField } from "./FormField";
import { cn } from "@/shared/lib/cn";
import { useMemo } from "react";
import type { MasterCodeResponseDto } from "../../model/institution.types";

interface ZoneOption {
  value: string; // zone ID
  label: string;
}

interface RegionOption {
  value: string;
  label: string;
  zoneId: string;
}

interface FormRegionGroupedFieldProps<TFieldValues extends FieldValues> {
  id: string;
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  control: Control<TFieldValues>;
  selectedZones: string[]; // zone IDs
  zoneOptions: ZoneOption[];
  allRegions: MasterCodeResponseDto[]; // all regions from the district
  error?: FieldError | FieldErrors<TFieldValues[Path<TFieldValues>]>;
  required?: boolean;
  disabled?: boolean;
}

export const FormRegionGroupedField = <TFieldValues extends FieldValues>({
  id,
  name,
  label,
  placeholder,
  control,
  selectedZones,
  zoneOptions,
  allRegions,
  error,
  required = false,
  disabled = false,
}: FormRegionGroupedFieldProps<TFieldValues>) => {
  // Handle array field errors - extract first error if it's an array
  const fieldError = Array.isArray(error) ? error[0] : error;

  // Filter regions by selected zones (regions have parentId matching zone IDs)
  const filteredRegions = useMemo(() => {
    if (selectedZones.length === 0) return [];
    
    const selectedZoneIds = selectedZones.map((id) => Number(id));
    return allRegions.filter((region) => 
      region.parentId !== null && selectedZoneIds.includes(region.parentId)
    );
  }, [allRegions, selectedZones]);

  // Group regions by zone
  const regionsByZone = useMemo(() => {
    const grouped: Record<string, RegionOption[]> = {};
    filteredRegions.forEach((region) => {
      if (region.parentId !== null) {
        const zoneId = String(region.parentId);
        if (!grouped[zoneId]) {
          grouped[zoneId] = [];
        }
        grouped[zoneId].push({
          value: String(region.id),
          label: region.codeName,
          zoneId: zoneId,
        });
      }
    });
    return grouped;
  }, [filteredRegions]);

  // Get zone labels for display
  const getZoneLabel = (zoneId: string) => {
    const zone = zoneOptions.find((z) => z.value === zoneId);
    return zone?.label || zoneId;
  };

  // Sort selected zones to match zoneOptions order
  const sortedSelectedZones = useMemo(() => {
    return selectedZones.slice().sort((a, b) => {
      const indexA = zoneOptions.findIndex((z) => z.value === a);
      const indexB = zoneOptions.findIndex((z) => z.value === b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [selectedZones, zoneOptions]);

  return (
    <FormField id={id} label={label} required={required} error={fieldError}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selectedValues: string[] = Array.isArray(field.value)
            ? (field.value as string[])
            : [];

          const handleRegionToggle = (regionValue: string, checked: boolean) => {
            const currentValues: string[] = Array.isArray(field.value)
              ? (field.value as string[])
              : [];
            if (checked) {
              field.onChange([...currentValues, regionValue]);
            } else {
              field.onChange(currentValues.filter((v) => v !== regionValue));
            }
          };

          // Get selected region labels for display
          const allRegionsList: RegionOption[] = [];
          Object.values(regionsByZone).forEach((regions) => {
            allRegionsList.push(...regions);
          });
          const selectedRegions = allRegionsList.filter((region) =>
            selectedValues.includes(region.value)
          );

          const displayText =
            selectedZones.length === 0
              ? placeholder
              : selectedValues.length === 0
              ? placeholder
              : selectedValues.length === 1
              ? selectedRegions[0]?.label || `${selectedValues.length} region selected`
              : `${selectedValues.length} regions selected`;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-10 rounded-xl border bg-secondary/40 px-3 py-2 text-sm md:text-xs ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 ease-in-out",
                    error ? "ring-2 ring-destructive" : "",
                    selectedValues.length === 0 ? "text-muted-foreground" : "",
                    selectedZones.length === 0 ? "opacity-50" : ""
                  )}
                  disabled={disabled || selectedZones.length === 0}
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
                className="w-[var(--radix-dropdown-menu-trigger-width)] p-3 border-secondary rounded-xl max-h-[400px] overflow-y-auto"
              >
                {selectedZones.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Please select zones first
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedSelectedZones.map((zoneId) => {
                      const zoneRegions = regionsByZone[zoneId] || [];
                      if (zoneRegions.length === 0) return null;

                      return (
                        <div key={zoneId} className="space-y-1">
                          {/* Zone Header */}
                          <div className="font-medium text-xs text-foreground">
                            {getZoneLabel(zoneId)}
                          </div>
                          {/* Regions Grid - 2 columns */}
                          <div className="grid grid-cols-2 gap-2 pl-2">
                            {zoneRegions.map((region) => {
                              const isChecked = selectedValues.includes(region.value);
                              return (
                                <div
                                  key={region.value}
                                  className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 hover:bg-primary/5 transition-colors"
                                  onClick={() => {
                                    if (!disabled) {
                                      handleRegionToggle(region.value, !isChecked);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (!disabled) {
                                        handleRegionToggle(
                                          region.value,
                                          checked as boolean
                                        );
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    disabled={disabled}
                                  />
                                  <span
                                    className={cn(
                                      "text-xs flex-1",
                                      isChecked && "text-primary font-medium"
                                    )}
                                  >
                                    {region.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {selectedZones.length > 0 &&
                      Object.keys(regionsByZone).length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No regions available for selected zones
                        </div>
                      )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }}
      />
    </FormField>
  );
};
