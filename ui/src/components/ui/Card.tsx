import React from 'react'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'bordered'
  hover?: boolean
  className?: string
}

export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
}: CardProps) {
  const variantClasses = {
    default: 'border border-border-subtle/20 bg-secondary/30 rounded-lg p-6',
    elevated: 'bg-secondary/40 border border-accent-cyan/20 rounded-lg p-8',
    bordered: 'border border-border-subtle bg-secondary rounded-lg p-6',
  }

  const hoverClass = hover ? 'hover:border-accent-cyan/50 transition-colors' : ''
  const shadowClass = variant === 'elevated' ? 'shadow-glow' : ''

  return (
    <div className={`${variantClasses[variant]} ${hoverClass} ${shadowClass} ${className}`}>
      {children}
    </div>
  )
}
