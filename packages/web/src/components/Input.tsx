import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="field-label">{label}</label>}
      <input
        ref={ref}
        className={['input', error ? 'has-error' : '', className].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className="field-help is-error">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'
export default Input
