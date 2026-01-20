import { useState, useRef, useEffect } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/lib/cn'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/shared/ui/use-toast'
import { useUploadSignature, usePatchInstructorMe } from '../../controller/mutations'

interface SignatureUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSignature?: string
}

/**
 * Signature Upload Dialog Component
 * Opens a dialog for uploading/removing signature images
 * Uses useUploadSignature mutation for upload and usePatchInstructorMe for remove
 */
export const SignatureUploadDialog = ({
  open,
  onOpenChange,
  currentSignature,
}: SignatureUploadDialogProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const uploadSignatureMutation = useUploadSignature()
  const patchInstructorMutation = usePatchInstructorMe()
  const [preview, setPreview] = useState<string | null>(currentSignature || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploading = uploadSignatureMutation.isPending || patchInstructorMutation.isPending

  // Reset preview when dialog opens/closes or currentSignature changes
  useEffect(() => {
    if (open) {
      setPreview(currentSignature || null)
      setSelectedFile(null)
    }
  }, [open, currentSignature])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('[SignatureUploadDialog] No file selected')
      return
    }

    console.log('[SignatureUploadDialog] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[SignatureUploadDialog] Invalid file type:', file.type)
      toast({
        title: t('common.error'),
        description: t('profile.validation.invalidImageType'),
        variant: 'error',
      })
      return
    }

    // Validate file size (max 10MB per API spec)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('[SignatureUploadDialog] File too large:', file.size, 'max:', maxSize)
      toast({
        title: t('common.error'),
        description: t('profile.validation.imageTooLarge'),
        variant: 'error',
      })
      return
    }

    // Validate allowed image types per API spec
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      console.error('[SignatureUploadDialog] Invalid file type:', file.type)
      toast({
        title: t('common.error'),
        description: t('profile.validation.invalidImageType'),
        variant: 'error',
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      console.log('[SignatureUploadDialog] Preview created, data URL length:', result.length)
      setPreview(result)
      setSelectedFile(file)
    }
    reader.onerror = () => {
      console.error('[SignatureUploadDialog] Error reading file')
      toast({
        title: t('common.error'),
        description: t('profile.validation.fileReadError'),
        variant: 'error',
      })
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      console.warn('[SignatureUploadDialog] No file selected for upload')
      return
    }

    console.log('[SignatureUploadDialog] Starting upload:', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
    })

    // Call upload signature mutation
    uploadSignatureMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        console.log('[SignatureUploadDialog] Upload successful:', {
          signatureUrl: data.signature,
        })
        toast({
          title: t('common.success'),
          description: t('profile.signatureUploadSuccess'),
          variant: 'success',
        })
        onOpenChange(false)
        setSelectedFile(null)
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
      onError: (error: unknown) => {
        console.error('[SignatureUploadDialog] Upload failed:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: string }).message)
              : t('profile.signatureUploadError')

        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: 'error',
        })
      },
    })
  }

  const handleRemove = () => {
    if (!currentSignature && !preview) {
      console.warn('[SignatureUploadDialog] No signature to remove')
      return
    }

    console.log('[SignatureUploadDialog] Removing signature')

    // Call mutation to remove signature (set to null)
    patchInstructorMutation.mutate(
      { signature: null },
      {
        onSuccess: () => {
          console.log('[SignatureUploadDialog] Signature removed successfully')
          toast({
            title: t('common.success'),
            description: t('profile.signatureRemoveSuccess'),
            variant: 'success',
          })
          setPreview(null)
          setSelectedFile(null)
          onOpenChange(false)
          // Reset input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        },
        onError: (error: unknown) => {
          console.error('[SignatureUploadDialog] Remove failed:', error)
          const errorMessage =
            error instanceof Error
              ? error.message
              : typeof error === 'object' && error !== null && 'message' in error
                ? String((error as { message: string }).message)
                : t('profile.signatureRemoveError')

          toast({
            title: t('common.error'),
            description: errorMessage,
            variant: 'error',
          })
        },
      }
    )
  }

  const handleClick = () => {
    console.log('[SignatureUploadDialog] File input clicked')
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    console.log('[SignatureUploadDialog] Dialog cancelled')
    setPreview(currentSignature || null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const hasChanges = selectedFile !== null || (preview !== currentSignature && preview !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('profile.uploadSignature')}</DialogTitle>
          <DialogDescription>{t('profile.signatureImageHint')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors',
              'hover:border-primary/50 hover:bg-secondary/50',
              preview ? 'border-primary' : 'border-border',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleClick}
          >
            {preview ? (
              <div className="relative w-full max-w-xs">
                <img
                  src={preview}
                  alt="Signature preview"
                  className="w-full h-auto max-h-48 object-contain rounded-lg border border-border"
                />
                {selectedFile && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {t('profile.new')}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {t('profile.clickToUpload')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('profile.signatureImageHint')}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={isUploading}
              className="flex-1 gap-2"
            >
              <Upload className="w-4 h-4" />
              {preview ? t('profile.changeImage') : t('profile.selectFile')}
            </Button>
            {(currentSignature || preview) && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.delete')}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !hasChanges}
          >
            {isUploading ? t('profile.uploading') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
