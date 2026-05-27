import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sage'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  block?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  block,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = ['btn', `is-${variant}`, size !== 'md' ? `size-${size}` : '', block ? 'is-block' : '', className]
    .filter(Boolean).join(' ')

  return (
    <button disabled={disabled || loading} className={cls} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
