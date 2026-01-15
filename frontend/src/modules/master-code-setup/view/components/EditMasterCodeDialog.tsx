import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Loader2, Check, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  useAllMasterCodesQuery,
  useCheckCodeExistsQuery,
} from "../../controller/queries";
import { useUpdateMasterCode } from "../../controller/mutations";
import {
  updateMasterCodeSchema,
  type UpdateMasterCodeFormData,
} from "../../model/master-code-setup.schema";
import { useToast } from "@/shared/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { masterCodeSetupQueryKeys } from "../../controller/queryKeys";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";

interface EditMasterCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: MasterCodeResponseDto | null;
}

export const EditMasterCodeDialog = ({
  open,
  onOpenChange,
  code,
}: EditMasterCodeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allMasterCodesData, isLoading: isLoadingMasterCodes } =
    useAllMasterCodesQuery();
  const allMasterCodes = allMasterCodesData?.items || [];

  const updateMutation = useUpdateMasterCode();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdateMasterCodeFormData>({
    resolver: zodResolver(updateMasterCodeSchema(t)),
    defaultValues: {
      code: undefined,
      codeName: "",
      parentId: null,
    },
  });

  // Watch code value for real-time validation
  const codeValue = watch("code");

  const [debouncedCode, setDebouncedCode] = useState<number | undefined>(
    undefined
  );
  const [showChecking, setShowChecking] = useState(false);
  const checkingStartTimeRef = useRef<number | null>(null);

  // Populate form when code changes
  useEffect(() => {
    if (code && open) {
      setValue("code", code.code);
      setValue("codeName", code.codeName);
      setValue("parentId", code.parentId);
      setDebouncedCode(undefined);
      setShowChecking(false);
      checkingStartTimeRef.current = null;
    } else if (!open) {
      reset();
      setDebouncedCode(undefined);
      setShowChecking(false);
      checkingStartTimeRef.current = null;
    }
  }, [code, open, setValue, reset]);

  // Debounce code value with 500ms delay
  useEffect(() => {
    if (!code || codeValue === code.code) {
      setDebouncedCode(undefined);
      return;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedCode(codeValue);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [codeValue, code]);

  // Check code existence with debounced value (only if code changed)
  const { data: isCodeAvailable, isLoading: isCheckingCode } =
    useCheckCodeExistsQuery(
      debouncedCode,
      !!debouncedCode &&
        debouncedCode > 0 &&
        !isNaN(debouncedCode) &&
        code !== null &&
        debouncedCode !== code.code
    );
  const codeAvailable = isCodeAvailable ?? false;

  // Show checking state for minimum 1 second
  useEffect(() => {
    if (isCheckingCode) {
      setShowChecking(true);
      checkingStartTimeRef.current = Date.now();
    } else {
      // When query finishes, ensure we've shown checking for at least 1 second
      if (checkingStartTimeRef.current !== null) {
        const elapsed = Date.now() - checkingStartTimeRef.current;
        const remainingTime = Math.max(0, 1000 - elapsed);

        if (remainingTime > 0) {
          const timeoutId = setTimeout(() => {
            setShowChecking(false);
            checkingStartTimeRef.current = null;
          }, remainingTime);

          return () => {
            clearTimeout(timeoutId);
          };
        } else {
          setShowChecking(false);
          checkingStartTimeRef.current = null;
        }
      } else {
        setShowChecking(false);
      }
    }
  }, [isCheckingCode]);

  const handleClose = () => {
    if (!updateMutation.isPending) {
      reset();
      setDebouncedCode(undefined);
      setShowChecking(false);
      checkingStartTimeRef.current = null;
      onOpenChange(false);
    }
  };

  const onSubmit = (data: UpdateMasterCodeFormData) => {
    if (!code) return;

    updateMutation.mutate(
      {
        id: code.id,
        data: {
          code: data.code!,
          codeName: data.codeName,
          parentId: data.parentId ?? null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: t("common.success"),
            description: t("masterCode.updateSuccess"),
          });

          // Refetch root master codes list
          queryClient.invalidateQueries({
            queryKey: masterCodeSetupQueryKeys.roots(),
          });
          queryClient.invalidateQueries({
            queryKey: masterCodeSetupQueryKeys.lists(),
          });

          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("masterCode.updateError"),
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!code) return null;

  const isCodeChanged = codeValue !== code.code;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            {t("masterCode.editCode")}
          </DialogTitle>
          <DialogDescription className="text-xs text-secondary-foreground/80">
            {t("masterCode.editCodeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Code Field */}
          <div className="space-y-1">
            <Label
              htmlFor="code"
              className="text-xs text-secondary-foreground/80"
            >
              {t("masterCode.code")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="code"
              type="number"
              placeholder={t("masterCode.codePlaceholder")}
              {...register("code", { valueAsNumber: true })}
              className={
                errors.code || (isCodeChanged && codeAvailable === false)
                  ? "ring-2 ring-destructive"
                  : ""
              }
              disabled={updateMutation.isPending}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
            {!errors.code &&
              isCodeChanged &&
              debouncedCode !== undefined &&
              debouncedCode !== null &&
              !isNaN(debouncedCode) &&
              debouncedCode > 0 && (
                <>
                  {showChecking || isCheckingCode ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t("masterCode.validation.checkingCode")}
                    </p>
                  ) : codeAvailable ? (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {t("masterCode.validation.codeAvailable")}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {t("masterCode.validation.codeUnavailable")}
                    </p>
                  )}
                </>
              )}
          </div>

          {/* Code Name Field */}
          <div className="space-y-1">
            <Label
              htmlFor="codeName"
              className="text-xs text-secondary-foreground/80"
            >
              {t("masterCode.codeName")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="codeName"
              type="text"
              placeholder={t("masterCode.codeNamePlaceholder")}
              {...register("codeName")}
              className={errors.codeName ? "ring-2 ring-destructive" : ""}
              disabled={updateMutation.isPending}
            />
            {errors.codeName && (
              <p className="text-xs text-destructive">
                {errors.codeName.message}
              </p>
            )}
          </div>

          {/* Parent Code Dropdown - Only show if code is not a root code */}
          {code.parentId !== null && (
            <div className="space-y-1">
              <Label
                htmlFor="parentId"
                className="text-xs text-secondary-foreground/80"
              >
                {t("masterCode.parentCode")}
              </Label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : Number(value));
                    }}
                    disabled={isLoadingMasterCodes || updateMutation.isPending}
                  >
                    <SelectTrigger
                      id="parentId"
                      className={errors.parentId ? "ring-2 ring-destructive" : ""}
                    >
                      <SelectValue placeholder={t("masterCode.noneRootLevel")} />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      <SelectItem value="none">
                        {t("masterCode.noneRootLevel")}
                      </SelectItem>
                      {allMasterCodes
                        .filter((c) => c.id !== code.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.codeName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.parentId && (
                <p className="text-xs text-destructive">
                  {errors.parentId.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {updateMutation.isPending
                ? t("common.loading")
                : t("common.update")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
