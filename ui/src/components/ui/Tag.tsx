import React from 'react'

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export default function Tag({ children, variant = 'default' }: TagProps) {
  const variantClasses = {
    default: 'bg-secondary/50 border border-accent-cyan/20 text-text-secondary rounded-full px-3 py-1 text-sm',
    outlined: 'border border-border-subtle text-text-secondary rounded-full px-3 py-1 text-sm',
  }

  return <span className={variantClasses[variant]}>{children}</span>
}
