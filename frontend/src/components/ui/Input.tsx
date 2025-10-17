import React from 'react'
import { clsx } from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    startIcon, 
    endIcon, 
    fullWidth = false,
    disabled,
    ...props 
  }, ref) => {
    const inputId = React.useId()
    
    return (
      <div className={clsx('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {startIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            id={inputId}
            type={type}
            className={clsx(
              // 基础样式
              'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
              'placeholder:text-text-placeholder',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200',
              
              // 图标间距调整
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              
              // 状态样式
              error 
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' 
                : 'border-border-base focus:border-primary-500 focus:ring-primary-500',
                
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {/* End Icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-danger-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea 组件
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    fullWidth = false,
    disabled,
    rows = 4,
    ...props 
  }, ref) => {
    const textareaId = React.useId()
    
    return (
      <div className={clsx('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        
        {/* Textarea */}
        <textarea
          id={textareaId}
          rows={rows}
          className={clsx(
            // 基础样式
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-text-placeholder',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            'resize-vertical',
            
            // 状态样式
            error 
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' 
              : 'border-border-base focus:border-primary-500 focus:ring-primary-500',
              
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-danger-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !error && (
          <p className="text-sm text-text-secondary">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Input, Textarea }