import type { SummonerProfile } from "../types";

export interface SummonerResultCardProps {
  profile: SummonerProfile | null;
  lastQueriedName?: string;
  lastQueriedTagline?: string;
  isLoading?: boolean;
  previewBackgroundUrl?: string;
  hasSubmitted?: boolean;
}

function formatRiotId(name?: string, tagLine?: string): string {
  if (!name) {
    return "";
  }

  return tagLine ? `${name} #${tagLine}` : name;
}

export function SummonerResultCard({
  profile,
  lastQueriedName,
  lastQueriedTagline,
  isLoading,
  previewBackgroundUrl,
  hasSubmitted,
}: SummonerResultCardProps) {
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
        <p className="m-0 text-center text-sm text-slate-200/75">
          Recherche en cours...
        </p>
      </section>
    );
  }

  if (!hasSubmitted) {
    return (
      <section
        className="flex min-h-[360px] flex-col justify-center gap-6 rounded-3xl border border-app-border bg-app-card p-8 text-center text-slate-200/70"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">
            Previsualisation en attente
          </h2>
          <p className="max-w-md text-sm text-slate-200/70">
            Validez une recherche pour afficher la banniere du joueur
            selectionne.
          </p>
        </div>
      </section>
    );
  }

  if (!profile) {
    const queriedLabel = formatRiotId(lastQueriedName, lastQueriedTagline);

    return (
      <section
        className="flex min-h-[360px] flex-col justify-center gap-6 rounded-3xl border border-app-border bg-app-card p-8 text-center text-slate-200/70"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-white">Aucun resultat</h2>
          <p className="max-w-md text-sm text-slate-200/70">
            Nous n'avons pas pu determiner ce joueur
            {queriedLabel ? ` (${queriedLabel})` : ""}. Verifiez le pseudo et le
            tag, puis relancez une recherche.
          </p>
        </div>
      </section>
    );
  }

  const displayName = formatRiotId(profile.name, profile.tagLine);
  const avatarUrl = profile.profileIconUrl;
  const avatarFallback = profile.name.charAt(0).toUpperCase();
  const backgroundImageUrl = profile.bannerUrl ?? previewBackgroundUrl;
  const statItems: Array<{ label: string; value: string }> = [
    { label: "LP", value: String(profile.leaguePoints) },
    { label: "Victoires", value: String(profile.wins) },
    { label: "Defaites", value: String(profile.losses) },
  ];

  return (
    <section
      className="flex min-h-[360px] flex-col gap-4 rounded-3xl border border-app-border bg-app-card p-6 sm:p-8"
      aria-live="polite"
    >
      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl bg-banner-fallback text-xs font-semibold uppercase tracking-wideish text-slate-100/80">
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-banner-placeholder">
            <span>Previsualisation de la banniere</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/70" />
        <div
          className="relative flex h-full w-full flex-col justify-between p-5 sm:p-8"
          role="img"
          aria-label={`Banniere de ${displayName}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-slate-900/90 text-2xl font-semibold shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-slate-200/85">
                    {avatarFallback}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {displayName}
                </p>
                <p className="text-sm font-medium text-amber-200/90">
                  {profile.tier} {profile.rank}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {statItems.map((stat) => (
              <dl
                key={stat.label}
                className="rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3 text-center backdrop-blur-[2px]"
              >
                <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-200/70">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </dl>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
