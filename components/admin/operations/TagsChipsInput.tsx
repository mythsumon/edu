'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Tag } from 'lucide-react'
import { Input } from '@/components/shared/common'

interface TagsChipsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagsChipsInput({ tags, onChange, placeholder = '태그 입력 후 Enter' }: TagsChipsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (!tags.includes(trimmed)) {
        onChange([...tags, trimmed])
        setInputValue('')
      }
    }
  }

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-3">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11 rounded-xl"
      />
    </div>
  )
}


