import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/cn";
import { Spinner } from "./Spinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  className?: string;
}

export const LoadingOverlay = ({ isLoading, className }: LoadingOverlayProps) => {
  const { t } = useTranslation();

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background/10 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm font-medium text-foreground">{t("common.loading")}</p>
      </div>
    </div>
  );
};
