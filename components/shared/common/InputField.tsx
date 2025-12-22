'use client'

import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  prefixIcon?: React.ReactNode
  type?: 'text' | 'email' | 'password'
  error?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  prefixIcon,
  type = 'text',
  error = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div
      className={`
        flex items-center
        h-12
        rounded-[9999px]
        bg-[#fff5f0]
        border border-[#ffeae0]
        transition-all duration-200
        focus-within:ring-2 focus-within:ring-[#ff8a65]/20 focus-within:border-[#ff8a65]
        ${error ? 'border-red-500 focus-within:ring-red-500/20' : ''}
        ${className}
      `}
    >
      {/* Left Icon Container */}
      {prefixIcon && (
        <div className="flex items-center justify-center w-11 h-full flex-shrink-0">
          {prefixIcon}
        </div>
      )}

      {/* Input Element */}
      <input
        ref={ref}
        type={inputType}
        className={`
          block
          flex-1
          h-full
          px-4
          py-0
          m-0
          bg-transparent
          border-0
          outline-none
          text-[#3a2e2a]
          text-base
          leading-normal
          placeholder:text-[#8d7c77]
          appearance-none
          -webkit-appearance-none
          ${prefixIcon ? 'pl-0' : ''}
          ${isPassword ? 'pr-0' : ''}
        `}
        style={{
          lineHeight: 'normal',
        }}
        {...props}
      />

      {/* Right Icon Container (Password Toggle) */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="flex items-center justify-center w-11 h-full flex-shrink-0 text-[#8d7c77] hover:text-[#3a2e2a] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  )
})

InputField.displayName = 'InputField'

