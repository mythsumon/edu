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
  useMasterCodeTreeQuery,
  useCheckCodeExistsQuery,
} from "../../controller/queries";
import { useUpdateMasterCode } from "../../controller/mutations";
import {
  updateMasterCodeSchema,
  type UpdateMasterCodeFormData,
} from "../../model/master-code-setup.schema";
import { useToast } from "@/shared/ui/use-toast";
import { cn } from "@/shared/lib/cn";
import type { MasterCodeResponseDto, MasterCodeTreeDto } from "../../model/master-code-setup.types";

interface EditMasterCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: MasterCodeResponseDto | null;
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

/**
 * Find all descendant IDs of a given code in the tree
 */
function findDescendantIds(
  tree: MasterCodeTreeDto[] | undefined,
  targetId: number
): Set<number> {
  const descendantIds = new Set<number>();

  function traverse(nodes: MasterCodeTreeDto[] | undefined) {
    if (!nodes) return;

    for (const node of nodes) {
      if (node.id === targetId) {
        // Found the target, collect all its children recursively
        collectDescendants(node.children);
        return;
      }
      // Continue searching in children
      traverse(node.children);
    }
  }

  function collectDescendants(nodes: MasterCodeTreeDto[] | undefined) {
    if (!nodes) return;

    for (const node of nodes) {
      descendantIds.add(node.id);
      // Recursively collect children of children
      collectDescendants(node.children);
    }
  }

  traverse(tree);
  return descendantIds;
}

export const EditMasterCodeDialog = ({
  open,
  onOpenChange,
  code,
}: EditMasterCodeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: masterCodeTree, isLoading: isLoadingMasterCodes } =
    useMasterCodeTreeQuery();

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
      code: "",
      codeName: "",
      parentId: null,
    },
  });

  // Watch code value for real-time validation
  const codeValue = watch("code");

  const [debouncedCode, setDebouncedCode] = useState<string | undefined>(
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
        debouncedCode.trim() !== '' &&
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
          code: data.code,
          codeName: data.codeName,
          parentId: data.parentId ?? null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: t("common.success"),
            description: t("masterCode.updateSuccess"),
            variant: "success",
          });

          // Query invalidation is handled by the mutation hook
          reset();
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: t("common.error"),
            description: t("masterCode.updateError"),
            variant: "error",
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
              type="text"
              placeholder={t("masterCode.codePlaceholder")}
              {...register("code")}
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
              debouncedCode.trim() !== '' && (
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
                render={({ field }) => {
                  const flattenedTree = flattenTree(masterCodeTree);
                  // Find all descendant IDs of the current code being edited
                  const descendantIds = findDescendantIds(masterCodeTree, code.id);
                  
                  // Filter out descendants (but keep the current code to show as disabled)
                  const filteredTree = flattenedTree.filter(
                    ({ node }) => !descendantIds.has(node.id)
                  );
                  
                  const selectedValue = field.value
                    ? String(field.value)
                    : "none";

                  return (
                    <Select
                      value={selectedValue}
                      onValueChange={(value) => {
                        // Prevent selecting the current code or its descendants
                        if (value === String(code.id) || descendantIds.has(Number(value))) {
                          return;
                        }
                        field.onChange(value === "none" ? null : Number(value));
                      }}
                      disabled={isLoadingMasterCodes || updateMutation.isPending}
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
                        {filteredTree.map(({ node, depth }) => {
                          const indentWidth = 1; // rem
                          const lineOffset = 0.75; // rem
                          const isSelected = selectedValue === String(node.id);
                          const isCurrentCode = node.id === code.id;
                          const isDisabled = isCurrentCode;

                          return (
                            <SelectItem
                              key={node.id}
                              className={cn(
                                "relative my-0.5",
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                              value={String(node.id)}
                              disabled={isDisabled}
                              style={{
                                paddingLeft: `${
                                  depth * indentWidth + lineOffset
                                }rem`,
                              }}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    isSelected && !isDisabled
                                      ? "bg-primary"
                                      : isDisabled
                                      ? "bg-muted-foreground"
                                      : "bg-background"
                                  )}
                                />
                                {node.codeName}
                                {isCurrentCode && (
                                  <span className="text-xs text-muted-foreground">
                                    ({t("masterCode.currentCode")})
                                  </span>
                                )}
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
