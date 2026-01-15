import { useTranslation } from "react-i18next";
import { AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";
import type { LucideIcon } from "lucide-react";

export type CustomConfirmDialogVariant = "destructive" | "warning" | "info" | "default";

interface CustomConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  variant?: CustomConfirmDialogVariant;
  icon?: LucideIcon;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  showCancel?: boolean;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const variantConfig: Record<
  CustomConfirmDialogVariant,
  { icon: LucideIcon; iconColor: string; iconBgColor: string }
> = {
  destructive: {
    icon: AlertCircle,
    iconColor: "text-destructive",
    iconBgColor: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-destructive",
    iconBgColor: "bg-destructive/10",
  },
  info: {
    icon: Info,
    iconColor: "text-primary",
    iconBgColor: "bg-primary/10",
  },
  default: {
    icon: AlertCircle,
    iconColor: "text-foreground",
    iconBgColor: "bg-muted",
  },
};

export const CustomConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  variant = "destructive",
  icon: CustomIcon,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  showCancel = true,
  confirmVariant,
}: CustomConfirmDialogProps) => {
  const { t } = useTranslation();
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const defaultConfirmVariant = variant === "destructive" || variant === "warning" 
    ? "destructive" 
    : "default";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] space-y-6">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                "rounded-full p-3",
                config.iconBgColor
              )}
            >
              <Icon
                className={cn("h-6 w-6", config.iconColor)}
                aria-hidden="true"
              />
            </div>
          </div>
          <DialogTitle className="text-lg font-medium text-foreground text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2 sm:gap-3">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText || t("common.cancel")}
            </Button>
          )}
          <Button
            type="button"
            variant={confirmVariant || defaultConfirmVariant}
            className={showCancel ? "flex-1" : ""}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText || t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
