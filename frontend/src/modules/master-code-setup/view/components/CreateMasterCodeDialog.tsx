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
  useCheckCodeExistsQuery,
  useMasterCodeTreeQuery,
} from "../../controller/queries";
import { useCreateMasterCode } from "../../controller/mutations";
import {
  createMasterCodeSchema,
  type CreateMasterCodeFormData,
} from "../../model/master-code-setup.schema";
import type { MasterCodeTreeDto } from "../../model/master-code-setup.types";
import { useToast } from "@/shared/ui/use-toast";
import { cn } from "@/shared/lib/cn";

interface CreateMasterCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Flatten tree structure for Select component with tree line information
 */
function flattenTree(
  tree: MasterCodeTreeDto[] | undefined,
  depth: number = 0,
  isLast: boolean[] = []
): Array<{
  node: MasterCodeTreeDto;
  depth: number;
  isLast: boolean[];
  hasChildren: boolean;
}> {
  if (!tree) return [];

  const result: Array<{
    node: MasterCodeTreeDto;
    depth: number;
    isLast: boolean[];
    hasChildren: boolean;
  }> = [];

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const isLastInLevel = i === tree.length - 1;
    const currentIsLast = [...isLast, isLastInLevel];
    const hasChildren = node.children && node.children.length > 0;

    result.push({
      node,
      depth,
      isLast: currentIsLast,
      hasChildren: !!hasChildren,
    });

    if (hasChildren) {
      result.push(...flattenTree(node.children, depth + 1, currentIsLast));
    }
  }

  return result;
}

export const CreateMasterCodeDialog = ({
  open,
  onOpenChange,
}: CreateMasterCodeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: masterCodeTree, isLoading: isLoadingMasterCodes } =
    useMasterCodeTreeQuery();

  const createMutation = useCreateMasterCode();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateMasterCodeFormData>({
    resolver: zodResolver(createMasterCodeSchema(t)),
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

  // Debounce code value with 500ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedCode(codeValue);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [codeValue]);

  // Check code existence with debounced value
  const { data: isCodeAvailable, isLoading: isCheckingCode } =
    useCheckCodeExistsQuery(
      debouncedCode,
      !!debouncedCode && debouncedCode > 0 && !isNaN(debouncedCode)
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
    if (!createMutation.isPending) {
      reset();
      setDebouncedCode(undefined);
      setShowChecking(false);
      checkingStartTimeRef.current = null;
      onOpenChange(false);
    }
  };

  const onSubmit = (data: CreateMasterCodeFormData) => {
    createMutation.mutate(
      {
        code: data.code!,
        codeName: data.codeName,
        parentId: data.parentId ?? null,
      },
      {
        onSuccess: () => {
          toast({
            title: t("common.success"),
            description: t("masterCode.createSuccess"),
          });

          // Query invalidation is handled by the mutation hook
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("masterCode.createError"),
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] min-w-[320px] rounded-2xl sm:w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-left">
            {t("masterCode.createNewCode")}
          </DialogTitle>
          <DialogDescription className="text-xs text-secondary-foreground/80 text-left">
            {t("masterCode.createNewCodeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Code Field */}
          <div className="space-y-1">
            <Label htmlFor="code">
              {t("masterCode.code")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="code"
              type="number"
              placeholder={t("masterCode.codePlaceholder")}
              {...register("code", { valueAsNumber: true })}
              className={errors.code ? "ring-2 ring-destructive" : ""}
              disabled={createMutation.isPending}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
            {!errors.code &&
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
            <Label htmlFor="codeName">
              {t("masterCode.codeName")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="codeName"
              type="text"
              placeholder={t("masterCode.codeNamePlaceholder")}
              {...register("codeName")}
              className={errors.codeName ? "ring-2 ring-destructive" : ""}
              disabled={createMutation.isPending}
            />
            {errors.codeName && (
              <p className="text-xs text-destructive">
                {errors.codeName.message}
              </p>
            )}
          </div>
          {/* Parent Code Dropdown */}
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
              render={({ field }) => {
                const flattenedTree = flattenTree(masterCodeTree);
                const selectedValue = field.value
                  ? String(field.value)
                  : "none";

                return (
                  <Select
                    value={selectedValue}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : Number(value));
                    }}
                    disabled={isLoadingMasterCodes || createMutation.isPending}
                  >
                    <SelectTrigger
                      id="parentId"
                      className={cn(
                        errors.parentId &&
                          "ring-2 ring-destructive focus:ring-destructive"
                      )}
                    >
                      <SelectValue
                        placeholder={t("masterCode.noneRootLevel")}
                      />
                    </SelectTrigger>
                    <SelectContent className="py-2 relative">
                      <SelectItem className="px-3.5" value="none">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              selectedValue === "none" ? "bg-primary" : "bg-background"
                            }`}
                          />
                          {t("masterCode.noneRootLevel")}
                        </span>
                      </SelectItem>
                      {flattenedTree.map(({ node, depth }) => {
                        const indentWidth = 1; // rem
                        const lineOffset = 0.75; // rem
                        const isSelected = selectedValue === String(node.id);

                        return (
                          <SelectItem
                            key={node.id}
                            className="relative my-0.5"
                            value={String(node.id)}
                            style={{
                              paddingLeft: `${
                                depth * indentWidth + lineOffset
                              }rem`,
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isSelected ? "bg-primary" : "bg-background"
                                }`}
                              />
                              {node.codeName}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.parentId && (
              <p className="text-xs text-destructive">
                {errors.parentId.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-y-2 gap-x-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-24"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="min-w-24"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {createMutation.isPending
                ? t("common.loading")
                : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
