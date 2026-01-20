import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Code2, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { useUiStore } from "@/shared/stores/ui.store";
import { useRootMasterCodesQuery, useMasterCodeHasChildrenQuery } from "../../controller/queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/components/ErrorState";
import { CreateMasterCodeDialog } from "./CreateMasterCodeDialog";
import { EditMasterCodeDialog } from "./EditMasterCodeDialog";
import { DeleteMasterCodeDialog } from "./DeleteMasterCodeDialog";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";

interface MasterCodeSidebarProps {
  selectedCodeId?: number | null;
  onSelectCode?: (code: MasterCodeResponseDto) => void;
}


interface MasterCodeListProps {
  codes: MasterCodeResponseDto[];
  selectedCodeId?: number | null;
  onSelectCode?: (code: MasterCodeResponseDto) => void;
  onEdit?: (code: MasterCodeResponseDto) => void;
  onDelete?: (code: MasterCodeResponseDto) => void;
}

const MasterCodeList = ({ codes, selectedCodeId, onSelectCode, onEdit, onDelete }: MasterCodeListProps) => {
  return (
    <div className="space-y-2">
      {codes.map((code) => (
        <MasterCodeItem
          key={code.id}
          code={code}
          isSelected={selectedCodeId === code.id}
          onSelect={onSelectCode}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

interface MasterCodeItemProps {
  code: MasterCodeResponseDto;
  isSelected: boolean;
  onSelect?: (code: MasterCodeResponseDto) => void;
  onEdit?: (code: MasterCodeResponseDto) => void;
  onDelete?: (code: MasterCodeResponseDto) => void;
}

const MasterCodeItem = ({ code, isSelected, onSelect, onEdit, onDelete }: MasterCodeItemProps) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { setMasterCodeSidebarOpen } = useUiStore();

  const handleSelect = () => {
    onSelect?.(code);
    // Close sidebar on mobile/tablet when selecting a code
    if (window.innerWidth < 1024) {
      setMasterCodeSidebarOpen(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onEdit?.(code);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    onDelete?.(code);
  };

  return (
    <div
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors relative group",
        "hover:text-accent-foreground",
        isSelected
          ? "bg-muted/50 text-secondary-foreground"
          : "bg-background text-secondary-foreground/60"
      )}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-r-md" />
      )}
      <button
        onClick={handleSelect}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        title={code.codeName}
      >
        <Code2
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isSelected ? 'text-secondary-foreground' : 'text-secondary-foreground/60'
          )}
        />
        <span
          className="truncate flex-1 min-w-0"
          title={code.codeName}
        >
          {code.codeName}
        </span>
      </button>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors opacity-100 lg:group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
            aria-label={t('sidebar.menu')}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2 rounded-xl" align="end">
          <div className="flex flex-col">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const MasterCodeSidebar = ({
  selectedCodeId,
  onSelectCode,
}: MasterCodeSidebarProps) => {
  const { t } = useTranslation();
  const { masterCodeSidebarOpen, setMasterCodeSidebarOpen } = useUiStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCodeForEdit, setSelectedCodeForEdit] = useState<MasterCodeResponseDto | null>(null);
  const [selectedCodeForDelete, setSelectedCodeForDelete] = useState<MasterCodeResponseDto | null>(null);
  const { data, isLoading, error, refetch } = useRootMasterCodesQuery();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if selected code for delete has children
  const { data: hasChildren } = useMasterCodeHasChildrenQuery(
    selectedCodeForDelete?.id,
    !!selectedCodeForDelete && deleteDialogOpen
  );

  const handleCodeClick = (code: MasterCodeResponseDto) => {
    onSelectCode?.(code);
    // Close sidebar on mobile/tablet when selecting a code
    if (window.innerWidth < 1024) {
      setMasterCodeSidebarOpen(false);
    }
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        masterCodeSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMasterCodeSidebarOpen(false);
      }
    };

    if (masterCodeSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when drawer is open on mobile
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [masterCodeSidebarOpen, setMasterCodeSidebarOpen]);

  const handleEdit = (code: MasterCodeResponseDto) => {
    setSelectedCodeForEdit(code);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedCodeForEdit(null);
  };

  const handleDelete = (code: MasterCodeResponseDto) => {
    setSelectedCodeForDelete(code);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedCodeForDelete(null);
  };

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className={cn(
        "flex flex-col h-full bg-background border-r",
        "w-64 min-w-64 max-w-80",
        // Mobile/Tablet: fixed drawer from left with smooth slide animation, positioned below header
        "fixed left-0 top-16 h-[calc(100vh-4rem)] z-40",
        masterCodeSidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Disable pointer events when off-screen on mobile
        !masterCodeSidebarOpen && "pointer-events-none lg:pointer-events-auto",
        // Desktop: always visible, relative positioning, no transform
        "lg:relative lg:translate-x-0 lg:top-0 lg:h-full",
        "transition-all duration-300 ease-in-out"
      )}
    >
        {/* Header */}
        <div className="space-y-4 px-3 pt-4 pb-2">
          <div className="w-4/5 mx-auto">
            <Button
              className="w-full"
              size="default"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('masterCode.createNewCode')}
            </Button>
          </div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('masterCode.masterCodes')}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(9)].map((_, index) => (
                <div
                  key={index}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-md"
                >
                  <Skeleton className="h-8 w-8 flex-shrink-0" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorState error={error} onRetry={() => refetch()} />
            </div>
          ) : (data?.items || []).length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {t('masterCode.noMasterCodesFound')}
            </div>
          ) : (
            <MasterCodeList
              codes={data?.items || []}
              selectedCodeId={selectedCodeId}
              onSelectCode={handleCodeClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
  );

  return (
    <>
      {/* Overlay for mobile/tablet - positioned below header */}
      <div
        className={cn(
          "fixed left-0 right-0 top-16 bottom-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300",
          masterCodeSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMasterCodeSidebarOpen(false)}
        aria-hidden="true"
      />

      {sidebarContent}
      <CreateMasterCodeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditMasterCodeDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        code={selectedCodeForEdit}
      />
      <DeleteMasterCodeDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        code={selectedCodeForDelete}
        hasChildren={hasChildren ?? false}
      />
    </>
  );
};
