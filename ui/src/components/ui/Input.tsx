import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <input
        className={`border rounded bg-secondary text-text-primary placeholder-text-tertiary focus-visible-ring hover:border-border-accent transition-colors px-3 py-2 ${
          error ? 'border-accent-purple' : 'border-border-subtle'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-accent-purple">{error}</span>}
    </div>
  )
}
