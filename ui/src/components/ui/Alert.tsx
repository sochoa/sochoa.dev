import React from 'react'

interface AlertProps {
  type: 'success' | 'error' | 'info'
  children: React.ReactNode
}

export default function Alert({ type, children }: AlertProps) {
  const typeClasses = {
    success: 'bg-secondary border border-accent-cyan text-accent-cyan',
    error: 'bg-secondary border border-accent-purple text-accent-purple',
    info: 'bg-secondary border border-border-subtle text-text-secondary',
  }

  return (
    <div className={`${typeClasses[type]} rounded p-4 mb-6 text-sm`} role="alert">
      {children}
    </div>
  )
}
