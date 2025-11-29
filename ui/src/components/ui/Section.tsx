import React from 'react'

interface SectionProps {
  title?: string
  children: React.ReactNode
  spacing?: 'tight' | 'normal' | 'loose'
  className?: string
}

export default function Section({
  title,
  children,
  spacing = 'normal',
  className = '',
}: SectionProps) {
  const spacingMap = {
    tight: 'mb-8',
    normal: 'mb-12',
    loose: 'mb-16',
  }

  return (
    <section className={`${spacingMap[spacing]} ${className}`}>
      {title && <h2 className="text-3xl font-bold text-accent-purple mb-8 font-mono">{title}</h2>}
      {children}
    </section>
  )
}
