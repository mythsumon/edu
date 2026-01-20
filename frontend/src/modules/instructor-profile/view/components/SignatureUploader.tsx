import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useTranslation } from 'react-i18next'
import { Label } from '@/shared/ui/label'

interface SignatureUploaderProps {
  currentSignature?: string
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
  className?: string
}

export const SignatureUploader = ({
  currentSignature,
  onUpload,
  isLoading = false,
  className,
}: SignatureUploaderProps) => {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(currentSignature || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('profile.validation.invalidImageType'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.validation.imageTooLarge'))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    try {
      setIsUploading(true)
      await onUpload(file)
    } catch (error) {
      console.error('Failed to upload signature:', error)
      setPreview(currentSignature || null)
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{t('profile.signatureImage')}</Label>
      <div className="space-y-2">
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors',
            'hover:border-primary/50 hover:bg-secondary/50',
            preview ? 'border-primary' : 'border-border',
            (isUploading || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
          onClick={handleClick}
        >
          {preview ? (
            <div className="relative w-full max-w-xs">
              <img
                src={preview}
                alt="Signature"
                className="w-full h-auto max-h-48 object-contain rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                disabled={isUploading || isLoading}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {t('profile.uploadSignature')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('profile.signatureImageHint')}
                </p>
              </div>
            </>
          )}
        </div>
        {!preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading || isLoading}
            className="w-full gap-2"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? t('profile.uploading') : t('profile.selectFile')}
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading || isLoading}
      />
    </div>
  )
}
