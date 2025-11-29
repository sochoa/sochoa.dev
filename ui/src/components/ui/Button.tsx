import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary:
      'bg-accent-cyan text-primary font-medium rounded border border-accent-cyan hover:bg-transparent hover:text-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'border border-border-subtle text-text-primary font-medium rounded hover:border-accent-cyan hover:text-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    text: 'text-accent-cyan hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  }

  return (
    <button className={`${variantClasses[variant]} ${className} focus-visible-ring px-4 py-2`} {...props}>
      {children}
    </button>
  )
}
