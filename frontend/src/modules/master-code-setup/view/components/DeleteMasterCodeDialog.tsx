import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { CustomConfirmDialog } from "@/shared/components/CustomConfirmDialog";
import { useDeleteMasterCode } from "../../controller/mutations";
import { useToast } from "@/shared/ui/use-toast";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";

interface DeleteMasterCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: MasterCodeResponseDto | null;
  hasChildren: boolean;
}

export const DeleteMasterCodeDialog = ({
  open,
  onOpenChange,
  code,
  hasChildren,
}: DeleteMasterCodeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const deleteMutation = useDeleteMasterCode();

  const handleDelete = async () => {
    if (!code) return;

    try {
      await deleteMutation.mutateAsync(code.id);
      toast({
        title: t('masterCode.deleteSuccess'),
        variant: 'default',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('masterCode.deleteError'),
        variant: 'destructive',
      });
    }
  };

  if (hasChildren) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('masterCode.hasChildrenDeleteError')}
            </DialogTitle>
            <DialogDescription>
              {t('masterCode.hasChildrenDeleteErrorDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <CustomConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('masterCode.deleteCode')}
      description={
        code
          ? t('masterCode.deleteConfirmation', { codeName: code.codeName })
          : ''
      }
      variant="destructive"
      confirmText={t('common.delete')}
      cancelText={t('common.cancel')}
      onConfirm={handleDelete}
      isLoading={deleteMutation.isPending}
    />
  );
};
