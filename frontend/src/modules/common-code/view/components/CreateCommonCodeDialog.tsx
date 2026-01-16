import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import { useCreateCommonCode } from "../../controller/mutations";
import {
  createCommonCodeSchema,
  type CreateCommonCodeFormData,
} from "../../model/common-code.schema";
import { useToast } from "@/shared/ui/use-toast";

interface CreateCommonCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: number | null;
  parentCodeName?: string;
  nextToCode?: string;
}

export const CreateCommonCodeDialog = ({
  open,
  onOpenChange,
  parentId,
  parentCodeName,
  nextToCode,
}: CreateCommonCodeDialogProps) => {
  const { t } = useTranslation();

  const { toast } = useToast();

  const createMutation = useCreateCommonCode();

  const isFromChildCard = useMemo(
    () => parentId !== undefined && parentId !== null,
    [parentId]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCommonCodeFormData>({
    resolver: zodResolver(
      createCommonCodeSchema(t)
    ) as Resolver<CreateCommonCodeFormData>,
    defaultValues: {
      code: isFromChildCard ? nextToCode : "",
      codeName: "",
      parentId: parentId ?? null,
    },
  });

  // Update form default values when isFromChildCard or related dependencies change
  useEffect(() => {
    reset({
      code: isFromChildCard ? nextToCode || "" : "",
      codeName: "",
      parentId: parentId ?? null,
    });
  }, [isFromChildCard, nextToCode, parentId, reset]);

  const handleClose = () => {
    if (!createMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  const onSubmit = (data: CreateCommonCodeFormData) => {
    createMutation.mutate(
      {
        code: data.code,
        codeName: data.codeName,
        parentId: data.parentId ?? null,
      },
      {
        onSuccess: () => {
          toast({
            title: t("common.success"),
            description: t("commonCode.createSuccess"),
            variant: "success",
          });

          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: t("common.error"),
            description: err?.message ?? t("commonCode.createError"),
            variant: "error",
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
            {t("commonCode.createNewCode")}
          </DialogTitle>
          <DialogDescription className="text-xs text-secondary-foreground/80 text-left">
            {t("commonCode.createNewCodeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(
            onSubmit as (data: CreateCommonCodeFormData) => void
          )}
          className="space-y-3"
        >
          {/* Parent Code Name Field - Only shown when called from ChildCodeCard */}
          {isFromChildCard && parentCodeName !== undefined && (
            <div className="space-y-1">
              <Label htmlFor="parentCodeName">
                {t("commonCode.parentCode")}
              </Label>
              <Input
                id="parentCodeName"
                type="text"
                value={parentCodeName}
                disabled
                className="bg-muted"
              />
            </div>
          )}
          {/* Code Field */}
          <div className="space-y-1">
            <Label
              htmlFor="code"
              className="text-xs text-secondary-foreground/80"
            >
              {t("commonCode.code")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="code"
              type="text"
              placeholder={t("commonCode.codePlaceholder")}
              {...register("code")}
              className={errors.code ? "ring-2 ring-destructive" : ""}
              disabled={createMutation.isPending || isFromChildCard}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
          {/* Code Name Field */}
          <div className="space-y-1">
            <Label
              htmlFor="codeName"
              className="text-xs text-secondary-foreground/80"
            >
              {t("commonCode.codeName")}
              <span className="text-destructive">**</span>
            </Label>
            <Input
              id="codeName"
              type="text"
              placeholder={t("commonCode.codeNamePlaceholder")}
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
          <DialogFooter className="gap-y-2 gap-x-2 pt-4">
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
