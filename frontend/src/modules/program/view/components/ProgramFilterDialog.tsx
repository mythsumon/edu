import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { FormMultiSelectDropdownField } from "./FormMultiSelectDropdownField";
import { useMasterCodeChildrenQuery } from "../../controller/queries";
import { MASTER_CODE_PARENT_CODES } from "@/shared/constants/master-code";
import { useForm, FieldError } from "react-hook-form";
import type { ProgramFilterData } from "../../model/program.types";

interface ProgramFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (filters: ProgramFilterData) => void;
}

interface FilterFormData {
  status: string[];
}

export const ProgramFilterDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: ProgramFilterDialogProps) => {
  const { t } = useTranslation();

  // Fetch program status from master code 1100
  const { data: statusData } = useMasterCodeChildrenQuery(
    MASTER_CODE_PARENT_CODES.PROGRAM_STATUS
  );
  const statusList = useMemo(
    () => statusData?.items || [],
    [statusData?.items]
  );

  // Transform API data to options format
  const statusOptions = useMemo(
    () =>
      statusList.map((status) => ({
        value: String(status.id),
        label: status.codeName,
      })),
    [statusList]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FilterFormData>({
    defaultValues: {
      status: [],
    },
  });

  // Helper to extract error from array field errors
  const getFieldError = (error: unknown) => {
    if (Array.isArray(error)) {
      return error[0];
    }
    return error as FieldError | undefined;
  };

  const handleReset = () => {
    reset({
      status: [],
    });
  };

  const handleConfirm = (data: FilterFormData) => {
    const filterData: ProgramFilterData = {
      status: data.status.length > 0 ? data.status : undefined,
    };
    onConfirm?.(filterData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {t("program.filter")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("program.filterDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleConfirm)}>
          <div className="space-y-2 py-0">
            {/* Status */}
            <FormMultiSelectDropdownField
              id="status"
              name="status"
              label={t("program.statusLabel")}
              placeholder={t("program.statusPlaceholder")}
              control={control}
              options={statusOptions}
              error={getFieldError(errors.status)}
            />
          </div>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              className="px-7"
              onClick={handleReset}
            >
              {t("common.reset")}
            </Button>
            <Button type="submit" className="px-7">
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
