import type { SummonerProfile } from '../types'

export interface SummonerResultCardProps {
  profile: SummonerProfile | null
  lastQueriedName?: string
  isLoading?: boolean
}

export function SummonerResultCard({ profile, lastQueriedName, isLoading }: SummonerResultCardProps) {
  if (isLoading) {
    return (
      <section
        className="flex min-h-[360px] flex-col gap-6 rounded-3xl border border-app-border bg-app-card p-8"
        aria-live="polite"
      >
        <div
          className="aspect-[3/1] w-full rounded-2xl bg-[linear-gradient(110deg,rgba(25,34,62,0.8)20%,rgba(42,58,96,0.9)40%,rgba(25,34,62,0.8)60%)] bg-[length:200%_100%] animate-shimmer"
          aria-hidden="true"
        />
        <p className="m-0 text-center text-sm text-slate-200/75">Recherche en cours...</p>
      </section>
    )
  }

  if (!profile) {
    return (
      <section
        className="flex min-h-[360px] flex-col justify-center gap-6 rounded-3xl border border-app-border bg-app-card p-8 text-center text-slate-200/70"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">{lastQueriedName ? 'Aucun resultat' : 'Pret a generer votre banniere'}</h2>
          <p className="max-w-md text-sm text-slate-200/70">
            {lastQueriedName
              ? `Nous n'avons pas encore trouve d'information pour "${lastQueriedName}".`
              : 'Recherchez un pseudo League of Legends pour voir la banniere qui correspond a son Elo.'}
          </p>
          {lastQueriedName ? (
            <p className="max-w-md text-sm text-slate-300/70">
              Verifiez l'orthographe du pseudo ou essayez un autre joueur.
            </p>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex min-h-[360px] flex-col gap-6 rounded-3xl border border-app-border bg-app-card p-8"
      aria-live="polite"
    >
      <div
        className="aspect-[3/1] w-full overflow-hidden rounded-2xl bg-banner-fallback text-xs font-semibold uppercase tracking-wideish text-slate-100/80"
        role="img"
        aria-label={`Banniere de ${profile.name}`}
      >
        {profile.bannerUrl ? (
          <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-banner-placeholder">
            <span>Previsualisation de la banniere</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/90 text-xl font-semibold">
            {profile.profileIconUrl ? (
              <img src={profile.profileIconUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl text-slate-200/85">{profile.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h2 className="m-0 text-2xl font-semibold text-white">{profile.name}</h2>
            <p className="mt-1 text-sm text-slate-200/70">
              {profile.tier} {profile.rank}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-center">
            <dt className="text-xs uppercase tracking-wideish text-slate-300/70">LP</dt>
            <dd className="mt-2 text-xl font-semibold text-white">{profile.leaguePoints}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-center">
            <dt className="text-xs uppercase tracking-wideish text-slate-300/70">Victoires</dt>
            <dd className="mt-2 text-xl font-semibold text-white">{profile.wins}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-center">
            <dt className="text-xs uppercase tracking-wideish text-slate-300/70">Defaites</dt>
            <dd className="mt-2 text-xl font-semibold text-white">{profile.losses}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
