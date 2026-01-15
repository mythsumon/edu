import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MasterCodeSidebar } from "../components/MasterCodeSidebar";
import { MasterCodeFolderCard } from "../components/MasterCodeFolderCard";
import { useMasterCodeChildrenQuery } from "../../controller/queries";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";

export const MasterCodeSetupPage = () => {
  const { t } = useTranslation();
  const [selectedCode, setSelectedCode] = useState<MasterCodeResponseDto | null>(null);

  const handleSelectCode = (code: MasterCodeResponseDto) => {
    setSelectedCode(code);
  };

  const {
    data: childrenData,
    isLoading: isLoadingChildren,
    error: childrenError,
  } = useMasterCodeChildrenQuery(selectedCode?.id ?? null, !!selectedCode);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar - Close to Header and Sidebar Menu */}
      <MasterCodeSidebar
        selectedCodeId={selectedCode?.id}
        onSelectCode={handleSelectCode}
      />

      {/* Right Content Area - Display children as folder cards */}
      <div className="flex-1 flex flex-col overflow-hidden bg-muted/50">
        {!selectedCode ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-muted-foreground">
              {t("masterCode.selectCodeToViewChildren")}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">
                {selectedCode.codeName} ({childrenData?.items.length ?? 0})
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("masterCode.childrenItems")}
              </p>
            </div>

            {/* Children Folder Cards */}
            {isLoadingChildren ? (
              <LoadingState />
            ) : childrenError ? (
              <ErrorState error={childrenError} />
            ) : !childrenData || childrenData.items.length === 0 ? (
              <EmptyState
                title={t("masterCode.noChildrenFound")}
                description={t("masterCode.noChildrenDescription")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {childrenData.items.map((child) => (
                  <MasterCodeFolderCard
                    key={child.id}
                    code={child}
                    onClick={handleSelectCode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
