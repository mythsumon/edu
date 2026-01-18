'use client'

import { useState, useEffect } from 'react'
import { Upload, message, Image } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import type { EvidenceItem } from '../types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_COUNT = 5 // 증빙자료는 최대 5장

interface EvidenceUploaderProps {
  items: EvidenceItem[]
  onChange: (items: EvidenceItem[]) => void
  disabled?: boolean
  uploadedBy?: string
}

export function EvidenceUploader({ 
  items, 
  onChange, 
  disabled = false,
  uploadedBy = '보조강사'
}: EvidenceUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Sync fileList with items prop
  useEffect(() => {
    setFileList(
      items.map((item) => ({
        uid: item.id,
        name: item.fileName,
        status: 'done' as const,
        url: item.fileUrl,
        size: item.fileSize,
      }))
    )
  }, [items])

  const handleChange: UploadProps['onChange'] = (info) => {
    const { fileList: newFileList } = info

    // Process new files that are being added
    const newFiles = newFileList.filter(f => 
      (f.status === 'uploading' || f.status === 'done') && 
      !items.find(item => item.id === f.uid)
    )
    
    if (newFiles.length === 0) {
      setFileList(newFileList.filter(f => f.status !== 'removed'))
      return
    }

    // Validate max count before processing
    const remainingSlots = MAX_COUNT - items.length
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
      return new Promise<EvidenceItem | null>((resolve) => {
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
          const now = new Date().toISOString()
          const evidenceItem: EvidenceItem = {
            id: file.uid,
            fileUrl: dataUrl,
            fileName: file.name,
            fileSize: file.size || 0,
            uploadedAt: now,
            uploadedBy: uploadedBy,
          }
          resolve(evidenceItem)
        }
        reader.onerror = () => {
          message.error(`${file.name}: 파일 읽기 중 오류가 발생했습니다.`)
          resolve(null)
        }
        reader.readAsDataURL(file.originFileObj)
      })
    })

    // Wait for all files to be processed
    Promise.all(processPromises).then((processedItems) => {
      const validItems = processedItems.filter((item): item is EvidenceItem => item !== null)
      if (validItems.length > 0) {
        const updatedItems = [...items, ...validItems]
        onChange(updatedItems)
      }
    })

    setFileList(newFileList.filter(f => f.status !== 'removed'))
  }

  const handleRemove = (file: UploadFile) => {
    const updatedItems = items.filter(item => item.id !== file.uid)
    onChange(updatedItems)
    
    const updatedFileList = fileList.filter(f => f.uid !== file.uid)
    setFileList(updatedFileList)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const itemCount = items.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            증빙자료 업로드 (보조강사)
          </span>
          <span className="text-sm font-semibold text-blue-600">
            업로드: {itemCount}/{MAX_COUNT}
          </span>
        </div>
        {itemCount === MAX_COUNT && (
          <span className="text-xs text-green-600 dark:text-green-400">
            최대 업로드 완료
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
        disabled={disabled || itemCount >= MAX_COUNT}
        beforeUpload={(file) => {
          // Prevent auto upload
          return false
        }}
      >
        {itemCount < MAX_COUNT && !disabled && (
          <div>
            <UploadOutlined className="text-2xl" />
            <div className="mt-2 text-sm">업로드</div>
          </div>
        )}
      </Upload>

      {/* Thumbnail Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
            >
              <div className="aspect-square relative">
                <Image
                  src={item.fileUrl}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                  preview={{
                    mask: '미리보기',
                  }}
                />
                {!disabled && (
                  <button
                    onClick={() => handleRemove({ uid: item.id } as UploadFile)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="삭제"
                  >
                    <DeleteOutlined className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-2 bg-white dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(item.fileSize)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {item.uploadedBy} | {new Date(item.uploadedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
