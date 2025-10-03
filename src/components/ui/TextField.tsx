import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/classnames'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

export function TextField({ id, label, hint, className, ...props }: TextFieldProps) {
  const inputId = id ?? props.name

  return (
    <label className={cn('flex flex-col gap-2', className)}>
      {label ? <span className="text-sm font-medium text-slate-200/80">{label}</span> : null}
      <input
        id={inputId}
        className="h-12 rounded-[14px] border border-white/10 bg-white/5 px-4 text-base text-white transition focus:border-sky-400/90 focus:outline-none focus:ring-4 focus:ring-sky-400/25 placeholder:text-slate-300/60"
        {...props}
      />
      {hint ? <span className="text-xs text-slate-300/70">{hint}</span> : null}
    </label>
  )
}
