import { useState, useRef } from 'react'
import { Upload, X, User } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useTranslation } from 'react-i18next'

interface AvatarUploaderProps {
  currentAvatar?: string
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
  className?: string
}

export const AvatarUploader = ({
  currentAvatar,
  onUpload,
  isLoading = false,
  className,
}: AvatarUploaderProps) => {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
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
      console.error('Failed to upload avatar:', error)
      setPreview(currentAvatar || null)
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
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
        {(preview || currentAvatar) && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
            onClick={handleRemove}
            disabled={isUploading || isLoading}
          >
            <X className="w-3 h-3" />
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
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isUploading || isLoading}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        {isUploading ? t('profile.uploading') : t('profile.uploadAvatar')}
      </Button>
    </div>
  )
}
