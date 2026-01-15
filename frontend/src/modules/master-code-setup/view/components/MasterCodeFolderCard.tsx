import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CodeXml, MoreVertical, Edit, Trash2 } from "lucide-react";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";
import { cn } from "@/shared/lib/cn";
import { formatDateDot } from "@/shared/lib/date";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { EditMasterCodeDialog } from "./EditMasterCodeDialog";
import { DeleteMasterCodeDialog } from "./DeleteMasterCodeDialog";
import { useMasterCodeHasChildrenQuery } from "../../controller/queries";

interface MasterCodeFolderCardProps {
  code: MasterCodeResponseDto;
  onClick?: (code: MasterCodeResponseDto) => void;
}

export const MasterCodeFolderCard = ({
  code,
  onClick,
}: MasterCodeFolderCardProps) => {
  const { t } = useTranslation();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if code has children for delete validation
  const { data: hasChildren } = useMasterCodeHasChildrenQuery(
    code.id,
    deleteDialogOpen
  );

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    setEditDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "group relative p-4 rounded-xl bg-card shadow-sm hover:shadow-md transition-all cursor-pointer",
          "flex flex-col min-h-[180px]"
        )}
        onClick={() => onClick?.(code)}
      >
        {/* More Options Icon - Top Right */}
        {/* Always visible on mobile/tablet, hover-only on laptop and larger */}
        <div className="absolute top-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex-shrink-0 p-1 rounded bg-muted lg:hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label={t('sidebar.menu')}
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
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

        {/* Code Icon - Center */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-12 h-12">
            <CodeXml className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Code Name - Below Icon */}
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-foreground truncate">
            {code.codeName}
          </p>
        </div>

        {/* Bottom Row - Code and Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2">
          <span>Code: {code.code}</span>
          <span>{formatDateDot(code.createdAt)}</span>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditMasterCodeDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        code={code}
      />

      {/* Delete Dialog */}
      <DeleteMasterCodeDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        code={code}
        hasChildren={hasChildren ?? false}
      />
    </>
  );
};
