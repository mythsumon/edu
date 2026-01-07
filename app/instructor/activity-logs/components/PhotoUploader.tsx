'use client'

import { useState, useEffect } from 'react'
import { Button, Upload, message, Image } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { UploadedImage } from '../types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_COUNT = 10
const MIN_REQUIRED = 5

interface PhotoUploaderProps {
  photos: UploadedImage[]
  onChange: (photos: UploadedImage[]) => void
  disabled?: boolean
}

export function PhotoUploader({ photos, onChange, disabled = false }: PhotoUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Sync fileList with photos prop
  useEffect(() => {
    setFileList(
      photos.map((photo) => ({
        uid: photo.id,
        name: photo.name,
        status: 'done' as const,
        url: photo.url,
        size: photo.size,
      }))
    )
  }, [photos])

  const handleChange: UploadProps['onChange'] = (info) => {
    const { fileList: newFileList } = info

    // Process new files that are being added
    const newFiles = newFileList.filter(f => 
      (f.status === 'uploading' || f.status === 'done') && 
      !photos.find(p => p.id === f.uid)
    )
    
    if (newFiles.length === 0) {
      setFileList(newFileList.filter(f => f.status !== 'removed'))
      return
    }

    // Validate max count before processing
    const remainingSlots = MAX_COUNT - photos.length
    if (remainingSlots <= 0) {
      message.warning(`최대 ${MAX_COUNT}장까지만 업로드 가능합니다.`)
      setFileList(newFileList.filter(f => f.status !== 'removed'))
      return
    }

    const filesToProcess = newFiles.slice(0, remainingSlots)
    if (newFiles.length > remainingSlots) {
      message.warning(`${remainingSlots}장만 업로드됩니다. (최대 ${MAX_COUNT}장)`)
    }

    // Process each new file
    const processPromises = filesToProcess.map((file) => {
      return new Promise<UploadedImage | null>((resolve) => {
        if (!file.originFileObj) {
          resolve(null)
          return
        }

        // Validate file type
        if (!file.type?.startsWith('image/')) {
          message.error(`${file.name}: 이미지 파일만 업로드 가능합니다.`)
          resolve(null)
          return
        }

        // Validate file size
        if (file.size && file.size > MAX_FILE_SIZE) {
          message.error(`${file.name}: 파일 크기는 10MB 이하여야 합니다.`)
          resolve(null)
          return
        }

        // Read file as data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          const uploadedImage: UploadedImage = {
            id: file.uid,
            file: file.originFileObj!,
            url: dataUrl,
            name: file.name,
            size: file.size || 0,
          }
          resolve(uploadedImage)
        }
        reader.onerror = () => {
          message.error(`${file.name}: 파일 읽기 중 오류가 발생했습니다.`)
          resolve(null)
        }
        reader.readAsDataURL(file.originFileObj)
      })
    })

    // Wait for all files to be processed
    Promise.all(processPromises).then((processedImages) => {
      const validImages = processedImages.filter((img): img is UploadedImage => img !== null)
      if (validImages.length > 0) {
        const updatedPhotos = [...photos, ...validImages]
        onChange(updatedPhotos)
      }
    })

    setFileList(newFileList.filter(f => f.status !== 'removed'))
  }

  const handleRemove = (file: UploadFile) => {
    const updatedPhotos = photos.filter(p => p.id !== file.uid)
    onChange(updatedPhotos)
    
    const updatedFileList = fileList.filter(f => f.uid !== file.uid)
    setFileList(updatedFileList)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const photoCount = photos.length
  const isValid = photoCount >= MIN_REQUIRED

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            사진자료 업로드
          </span>
          <span className={`text-sm font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            업로드: {photoCount}/{MIN_REQUIRED}
          </span>
        </div>
        {!isValid && (
          <span className="text-xs text-red-600 dark:text-red-400">
            최소 {MIN_REQUIRED}장의 사진이 필요합니다.
          </span>
        )}
      </div>

      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onRemove={handleRemove}
        accept="image/*"
        multiple
        maxCount={MAX_COUNT}
        disabled={disabled || photoCount >= MAX_COUNT}
        beforeUpload={(file) => {
          // Prevent auto upload
          return false
        }}
      >
        {photoCount < MAX_COUNT && !disabled && (
          <div>
            <UploadOutlined className="text-2xl" />
            <div className="mt-2 text-sm">업로드</div>
          </div>
        )}
      </Upload>

      {/* Thumbnail Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
            >
              <div className="aspect-square relative">
                <Image
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                  preview={{
                    mask: '미리보기',
                  }}
                />
                {!disabled && (
                  <button
                    onClick={() => handleRemove({ uid: photo.id } as UploadFile)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="삭제"
                  >
                    <DeleteOutlined className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-2 bg-white dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {photo.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(photo.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

