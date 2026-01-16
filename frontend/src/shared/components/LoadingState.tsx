import { useTranslation } from "react-i18next";

export const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/80 border-t-transparent" />
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  )
}

