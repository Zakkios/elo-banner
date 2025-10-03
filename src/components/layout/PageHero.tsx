import type { ReactNode } from 'react'

export interface PageHeroProps {
  title: string
  subtitle?: string
  description?: ReactNode
}

export function PageHero({ title, subtitle, description }: PageHeroProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-app-border bg-app-surface px-10 py-10 shadow-hero backdrop-blur-2xl md:gap-5 md:px-12 md:py-12">
      <h1 className="m-0 text-4xl font-bold tracking-tightest text-white sm:text-5xl lg:text-6xl">{title}</h1>
      {subtitle ? (
        <p className="m-0 text-lg text-slate-200/80 lg:text-xl">
          {subtitle}
        </p>
      ) : null}
      {description ? <div className="m-0 max-w-2xl text-slate-200/70">{description}</div> : null}
    </div>
  )
}
