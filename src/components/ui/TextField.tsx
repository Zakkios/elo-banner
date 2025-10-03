import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/classnames'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  leftAddon?: ReactNode
}

export function TextField({ id, label, hint, className, leftAddon, ...props }: TextFieldProps) {
  const inputId = id ?? props.name

  return (
    <label className={cn('flex flex-col gap-2', className)}>
      {label ? <span className="text-sm font-medium text-slate-200/80">{label}</span> : null}
      <div className={cn('flex h-12 items-center gap-[2px] rounded-[14px] border border-white/10 bg-white/5 px-1', props.readOnly ? 'opacity-75' : undefined)}>
        {leftAddon ? (
          <span className="flex h-10 items-center rounded-[10px] bg-white/10 px-3 text-base font-semibold text-slate-200/80">{leftAddon}</span>
        ) : null}
        <input
          id={inputId}
          className={cn(
            'h-10 w-full rounded-[10px] border-none bg-transparent px-3 text-base text-white outline-none placeholder:text-slate-300/60 focus:ring-0',
            leftAddon ? 'sm:text-lg' : undefined,
          )}
          {...props}
        />
      </div>
      {hint ? <span className="text-xs text-slate-300/70">{hint}</span> : null}
    </label>
  )
}
