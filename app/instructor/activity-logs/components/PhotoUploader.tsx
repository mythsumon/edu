'use client'

import { useState, useEffect } from 'react'
import { Button, Upload, message, Image } from 'antd'
import { UploadOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { UploadedImage } from '../types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_COUNT = 10
const MIN_REQUIRED = 2
const MAX_MAIN_PHOTOS = 2

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

  const handleToggleMain = (photoId: string) => {
    const target = photos.find(p => p.id === photoId)
    if (!target) return

    // Already main → unselect
    if (target.isMainPhoto) {
      onChange(photos.map(p => (p.id === photoId ? { ...p, isMainPhoto: false } : p)))
      return
    }

    // Check current main count
    const currentMainCount = photos.filter(p => p.isMainPhoto).length
    if (currentMainCount >= MAX_MAIN_PHOTOS) {
      message.warning(
        `대표 사진은 최대 ${MAX_MAIN_PHOTOS}장까지 선택할 수 있습니다. 기존 선택을 해제한 뒤 다시 골라주세요.`
      )
      return
    }

    onChange(photos.map(p => (p.id === photoId ? { ...p, isMainPhoto: true } : p)))
  }

  const mainPhotoCount = photos.filter(p => p.isMainPhoto).length

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const photoCount = photos.length
  const isValid = photoCount >= MIN_REQUIRED

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            사진자료 업로드
          </span>
          <span className={`text-sm font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            업로드: {photoCount}/{MIN_REQUIRED}
          </span>
          <span className="text-sm font-semibold text-amber-600">
            <StarFilled className="mr-1" />
            대표 사진: {mainPhotoCount}/{MAX_MAIN_PHOTOS}
          </span>
        </div>
        {!isValid && (
          <span className="text-xs text-red-600 dark:text-red-400">
            최소 {MIN_REQUIRED}장의 사진이 필요합니다.
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        각 사진 상단의 별 아이콘을 눌러 공문에 들어갈 대표 사진을 최대 {MAX_MAIN_PHOTOS}장까지 선택할 수 있습니다.
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
              className={`relative group border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 transition-all ${
                photo.isMainPhoto
                  ? 'border-amber-400 ring-2 ring-amber-200 dark:ring-amber-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
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
                    type="button"
                    onClick={() => handleToggleMain(photo.id)}
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors ${
                      photo.isMainPhoto
                        ? 'bg-amber-400 text-white hover:bg-amber-500'
                        : 'bg-white/90 text-gray-500 hover:bg-amber-50 hover:text-amber-500'
                    }`}
                    aria-label={photo.isMainPhoto ? '대표 사진 해제' : '대표 사진으로 선택'}
                    title={photo.isMainPhoto ? '대표 사진 해제' : '대표 사진으로 선택'}
                  >
                    {photo.isMainPhoto ? <StarFilled /> : <StarOutlined />}
                  </button>
                )}
                {photo.isMainPhoto && (
                  <div className="absolute bottom-2 left-2 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded shadow">
                    대표
                  </div>
                )}
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

