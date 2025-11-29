import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <section className="mb-12">
      <h1 className="text-4xl font-bold text-accent-purple mb-4 font-mono">{title}</h1>
      {subtitle && <p className="text-lg text-text-secondary mb-6">{subtitle}</p>}
      {children}
    </section>
  )
}
