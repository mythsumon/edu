import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, SquareChevronRight } from "lucide-react";
import { useUiStore } from "@/shared/stores/ui.store";
import { MasterCodeSidebar } from "../components/MasterCodeSidebar";
import { MasterCodeFolderCard } from "../components/MasterCodeFolderCard";
import { useMasterCodeChildrenQuery } from "../../controller/queries";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { cn } from "@/shared/lib/cn";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";

export const MasterCodeSetupPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toggleMasterCodeSidebarOpen, masterCodeSidebarOpen, setMasterCodeSidebarOpen } = useUiStore();
  const [selectedCode, setSelectedCode] = useState<MasterCodeResponseDto | null>(null);
  const [navigationPath, setNavigationPath] = useState<MasterCodeResponseDto[]>([]);

  const handleSelectCode = (code: MasterCodeResponseDto) => {
    setSelectedCode(code);
    
    // Build navigation path
    if (code.parentId === null) {
      // Root code - reset path
      setNavigationPath([code]);
    } else {
      // Child code - find parent in current path and extend
      const lastPathItem = navigationPath[navigationPath.length - 1];
      
      // If the last item in path is the parent, simply append
      if (lastPathItem && lastPathItem.id === code.parentId) {
        setNavigationPath([...navigationPath, code]);
      } else {
        // Parent not at the end of path - find it in the path
        const parentIndex = navigationPath.findIndex((item) => item.id === code.parentId);
        if (parentIndex >= 0) {
          // Parent found in path - extend from parent (truncate and append)
          setNavigationPath([...navigationPath.slice(0, parentIndex + 1), code]);
        } else if (selectedCode && selectedCode.id === code.parentId) {
          // Current selectedCode is the parent - add it to path if not already there, then append code
          if (navigationPath.length === 0 || navigationPath[navigationPath.length - 1].id !== selectedCode.id) {
            setNavigationPath([...navigationPath, selectedCode, code]);
          } else {
            setNavigationPath([...navigationPath, code]);
          }
        } else {
          // Parent not found - start fresh (this shouldn't happen in normal navigation)
          setNavigationPath([code]);
        }
      }
    }
  };

  const handleBreadcrumbClick = (code: MasterCodeResponseDto, index: number) => {
    // Navigate to clicked level
    setSelectedCode(code);
    // Truncate path to clicked level
    setNavigationPath(navigationPath.slice(0, index + 1));
  };

  // Only show breadcrumb if depth >= 2 (child level or deeper)
  // Example: Testing C (root) -> no breadcrumb
  //          Testing C-A (child) -> breadcrumb shows: Testing C > Testing C-A
  //          Testing C-A-A (grandchild) -> breadcrumb shows: Testing C > Testing C-A > Testing C-A-A
  const shouldShowBreadcrumb = navigationPath.length >= 2;

  // Close sidebar when navigating away from this page
  useEffect(() => {
    if (masterCodeSidebarOpen) {
      setMasterCodeSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
        {/* Toggle Button - Mobile/Tablet only */}
        <div className="lg:hidden p-2 border-b border-muted">
          <button
            onClick={toggleMasterCodeSidebarOpen}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t("masterCode.toggleSidebar")}
          >
            <SquareChevronRight className="w-5 h-5" />
          </button>
        </div>

        {!selectedCode ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-muted-foreground">
              {t("masterCode.selectCodeToViewChildren")}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            {/* Header */}
            <div className="mb-6">
              {/* Breadcrumb - Only show if depth >= 2 (child level or deeper) */}
              {shouldShowBreadcrumb && (
                <div className="mb-2">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {navigationPath.map((code, index) => {
                        const isLast = index === navigationPath.length - 1;
                        return (
                          <div key={code.id} className="flex items-center">
                            <BreadcrumbItem>
                              {isLast ? (
                                <span className="text-xs text-primary font-semibold">
                                  {code.codeName}
                                </span>
                              ) : (
                                <BreadcrumbLink asChild>
                                  <button
                                    onClick={() => handleBreadcrumbClick(code, index)}
                                    className={cn(
                                      "transition-colors text-xs text-primary hover:text-primary/80 cursor-pointer bg-transparent border-none p-0"
                                    )}
                                  >
                                    {code.codeName}
                                  </button>
                                </BreadcrumbLink>
                              )}
                            </BreadcrumbItem>
                            {index < navigationPath.length - 1 && (
                              <BreadcrumbSeparator className="text-muted-foreground pt-px ml-3" />
                            )}
                          </div>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              )}
              
              <h2 className="text-xl font-semibold mb-1">
                {selectedCode.codeName} ({childrenData?.items.length ?? 0})
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("masterCode.code")}: {selectedCode.code}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
