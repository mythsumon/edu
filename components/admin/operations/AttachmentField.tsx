'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { Button } from 'antd'

interface UploadedFile {
  uid: string
  name: string
  type?: string
  originFileObj?: File
  url?: string
}

interface AttachmentFieldProps {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxSize?: number // in MB
  accept?: string
}

export function AttachmentField({ files, onChange, maxSize = 10, accept = 'image/*' }: AttachmentFieldProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const selectedFiles = Array.from(fileList)
    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      originFileObj: file,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    onChange([...files, ...newFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = '' // Reset input
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleRemove = (uid: string) => {
    const fileToRemove = files.find(f => f.uid === uid)
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    onChange(files.filter(f => f.uid !== uid))
  }

  const handleReplace = (uid: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const fileToReplace = files.find(f => f.uid === uid)
    if (fileToReplace?.url) {
      URL.revokeObjectURL(fileToReplace.url)
    }

    const newFile: UploadedFile = {
      uid,
      name: selectedFile.name,
      type: selectedFile.type,
      originFileObj: selectedFile,
      url: selectedFile.type.startsWith('image/') ? URL.createObjectURL(selectedFile) : undefined,
    }

    onChange(files.map(f => f.uid === uid ? newFile : f))
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center h-32 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="text-center">
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF 최대 {maxSize}MB</p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.uid} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {file.url ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-700 truncate px-1">{file.name}</div>
              
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => handleReplace(file.uid, e)}
                    className="hidden"
                  />
                  <Button
                    size="small"
                    className="bg-white text-gray-900 border-0 hover:bg-gray-100"
                  >
                    교체
                  </Button>
                </label>
                <Button
                  size="small"
                  danger
                  icon={<X className="w-3 h-3" />}
                  onClick={() => handleRemove(file.uid)}
                  className="bg-white text-red-600 border-0 hover:bg-red-50"
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

