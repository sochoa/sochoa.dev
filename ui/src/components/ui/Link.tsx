import React from 'react'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'

interface LinkProps extends RouterLinkProps {
  variant?: 'accent' | 'text'
  children: React.ReactNode
}

export default function Link({ variant = 'accent', children, className = '', ...props }: LinkProps) {
  const variantClasses = {
    accent: 'text-accent-cyan hover:text-text-primary transition-colors',
    text: 'text-text-primary hover:text-accent-cyan transition-colors',
  }

  return (
    <RouterLink className={`${variantClasses[variant]} focus-visible-ring rounded px-1 py-0.5 inline-block ${className}`} {...props}>
      {children}
    </RouterLink>
  )
}
