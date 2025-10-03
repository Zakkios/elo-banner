import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/classnames'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  const baseClasses = 'inline-flex h-12 items-center justify-center rounded-[14px] border border-transparent px-5 font-semibold text-base leading-tight transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/35 disabled:pointer-events-none disabled:opacity-60'
  const variantClasses =
    variant === 'primary'
      ? 'bg-button-primary bg-[length:200%_100%] text-slate-900 shadow-button-primary hover:-translate-y-[2px] hover:shadow-button-primary-hover active:translate-y-0 active:shadow-button-primary'
      : 'border-white/15 bg-white/5 text-slate-100 hover:border-white/35 hover:bg-white/10'

  return <button type={type} className={cn(baseClasses, variantClasses, className)} {...props} />
}
