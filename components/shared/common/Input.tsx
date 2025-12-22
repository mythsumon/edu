'use client'

import { Input as AntInput, InputProps, TextAreaProps } from 'antd'
import React from 'react'

interface CustomInputProps extends Omit<InputProps, 'variant'> {
  variant?: 'default' | 'search'
}

const baseInputClassName = 'h-12 text-base [&_.ant-input-wrapper]:!flex [&_.ant-input-wrapper]:!items-center [&_.ant-input-wrapper]:!h-12 [&_.ant-input-wrapper]:!rounded-[9999px] [&_.ant-input-wrapper]:!bg-[#fff5f0] [&_.ant-input-wrapper]:!border [&_.ant-input-wrapper]:!border-[#ffeae0] [&_.ant-input-wrapper]:!transition-all [&_.ant-input-wrapper]:!duration-200 [&_.ant-input-wrapper]:!focus-within:ring-2 [&_.ant-input-wrapper]:!focus-within:ring-[#ff8a65]/20 [&_.ant-input-wrapper]:!focus-within:border-[#ff8a65] [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!rounded-[9999px] [&_.ant-input]:!h-12 [&_.ant-input]:!text-[#3a2e2a] [&_.ant-input]:!leading-normal [&_.ant-input]:!py-0 [&_.ant-input]:!pt-0 [&_.ant-input]:!pb-0 [&_.ant-input]:!px-4 [&_.ant-input]:!m-0 [&_.ant-input]:!outline-none [&_.ant-input]:!appearance-none [&_.ant-input]:!-webkit-appearance-none [&_.ant-input::placeholder]:!text-[#8d7c77] [&_.ant-input-prefix]:!flex [&_.ant-input-prefix]:!items-center [&_.ant-input-prefix]:!justify-center [&_.ant-input-prefix]:!h-full [&_.ant-input-prefix]:!w-11 [&_.ant-input-prefix]:!flex-shrink-0 [&_.ant-input-prefix]:!mr-0 [&_.ant-input-suffix]:!flex [&_.ant-input-suffix]:!items-center [&_.ant-input-suffix]:!justify-center [&_.ant-input-suffix]:!h-full'

const InputComponent: React.FC<CustomInputProps> = ({ 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  return (
    <AntInput
      {...props}
      className={`${baseInputClassName} ${className}`}
    />
  )
}

// Password component with same styling
const PasswordComponent: React.FC<InputProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <AntInput.Password
      {...props}
      className={`${baseInputClassName} [&_.ant-input-password-icon]:!flex [&_.ant-input-password-icon]:!items-center [&_.ant-input-password-icon]:!justify-center [&_.ant-input-password-icon]:!h-full ${className}`}
    />
  )
}

// TextArea component with same styling
const TextAreaComponent: React.FC<TextAreaProps> = ({ 
  className = '', 
  ...props 
}) => {
  return (
    <AntInput.TextArea
      {...props}
      className={`${baseInputClassName} [&_.ant-input]:!min-h-[120px] ${className}`}
    />
  )
}

// Create Input with all Ant Design Input sub-components
export const Input = Object.assign(InputComponent, {
  Password: PasswordComponent,
  TextArea: TextAreaComponent,
  Search: AntInput.Search,
  Group: AntInput.Group,
})

