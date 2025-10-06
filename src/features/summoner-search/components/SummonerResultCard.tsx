import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SummonerProfile } from "../types";
import {
  getRankStyle,
  calculateWinRate,
  getTotalGames,
} from "../utils/rankUtils";
import {
  downloadBannerAsImage,
  generateBannerFilename,
} from "../utils/downloadBanner";

export interface SummonerResultCardProps {
  profile: SummonerProfile | null;
  lastQueriedName?: string;
  lastQueriedTagline?: string;
  isLoading?: boolean;
  previewBackgroundUrl?: string;
  hasSubmitted?: boolean;
  backgroundOffset?: number;
  onBackgroundOffsetChange?: (offset: number) => void;
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
  backgroundOffset = 0,
  onBackgroundOffsetChange,
}: SummonerResultCardProps) {
  // Tous les hooks doivent être au début du composant
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startY: number;
    startOffset: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const backgroundImageUrl = profile?.bannerUrl ?? previewBackgroundUrl;
  const canAdjustBackground = Boolean(
    onBackgroundOffsetChange && backgroundImageUrl
  );

  const clampOffset = useCallback((offset: number) => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) {
      return offset;
    }

    const containerHeight = container.getBoundingClientRect().height;
    const imageHeight = image.getBoundingClientRect().height;

    // Si l'image n'est pas encore chargée ou est plus petite que le conteneur
    if (!imageHeight || imageHeight <= containerHeight) {
      return 0;
    }

    // La limite est la moitié de la différence entre la hauteur de l'image et du conteneur
    const limit = (imageHeight - containerHeight) / 2;
    return Math.max(-limit, Math.min(limit, offset));
  }, []);

  useEffect(() => {
    if (!canAdjustBackground || !onBackgroundOffsetChange) {
      return;
    }

    const clamped = clampOffset(backgroundOffset);
    if (clamped !== backgroundOffset) {
      onBackgroundOffsetChange(clamped);
    }
  }, [
    backgroundOffset,
    canAdjustBackground,
    clampOffset,
    onBackgroundOffsetChange,
  ]);

  useEffect(() => {
    if (
      !canAdjustBackground ||
      !onBackgroundOffsetChange ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    const image = imageRef.current;
    const container = containerRef.current;

    if (!image || !container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const clamped = clampOffset(backgroundOffset);
      if (clamped !== backgroundOffset) {
        onBackgroundOffsetChange(clamped);
      }
    });

    observer.observe(image);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [
    backgroundOffset,
    canAdjustBackground,
    clampOffset,
    onBackgroundOffsetChange,
  ]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!canAdjustBackground || event.button !== 0) {
        return;
      }

      event.preventDefault();
      dragStateRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startOffset: backgroundOffset,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [backgroundOffset, canAdjustBackground]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (
        !dragState ||
        !canAdjustBackground ||
        !onBackgroundOffsetChange ||
        dragState.pointerId !== event.pointerId
      ) {
        return;
      }

      const deltaY = event.clientY - dragState.startY;
      const nextOffset = clampOffset(dragState.startOffset + deltaY);
      onBackgroundOffsetChange(nextOffset);
    },
    [canAdjustBackground, clampOffset, onBackgroundOffsetChange]
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!bannerRef.current || !profile) {
      return;
    }

    setIsDownloading(true);

    try {
      const filename = generateBannerFilename(profile.name, profile.tagLine);
      await downloadBannerAsImage(bannerRef.current, { filename });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Impossible de télécharger la bannière. Veuillez réessayer.");
    } finally {
      setIsDownloading(false);
    }
  }, [profile]);

  // Early returns après tous les hooks
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
  const rankStyle = getRankStyle(profile.tier);
  const winRate = calculateWinRate(profile.wins, profile.losses);
  const totalGames = getTotalGames(profile.wins, profile.losses);

  return (
    <section
      className="flex min-h-[360px] flex-col gap-4 rounded-3xl border border-app-border bg-app-card p-6 sm:p-8"
      aria-live="polite"
    >
      <div
        ref={bannerRef}
        className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl bg-banner-fallback text-xs font-semibold uppercase tracking-wideish text-slate-100/80"
        role="img"
        aria-label={`Banniere de ${displayName}`}
      >
        <div
          ref={containerRef}
          className="absolute inset-0"
          onPointerDown={canAdjustBackground ? handlePointerDown : undefined}
          onPointerMove={canAdjustBackground ? handlePointerMove : undefined}
          onPointerUp={canAdjustBackground ? endDrag : undefined}
          onPointerCancel={canAdjustBackground ? endDrag : undefined}
          style={
            canAdjustBackground
              ? { cursor: isDragging ? "grabbing" : "grab" }
              : undefined
          }
        >
        {backgroundImageUrl ? (
          <img
            ref={imageRef}
            src={backgroundImageUrl}
            alt=""
            className="absolute w-full object-cover"
            style={
              canAdjustBackground
                ? {
                    height: "auto",
                    minHeight: "100%",
                    top: "50%",
                    transform: `translateY(calc(-50% + ${backgroundOffset}px))`,
                  }
                : { height: "100%", objectFit: "cover" }
            }
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-banner-placeholder">
            <span>Previsualisation de la banniere</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/85" />
        <div className="relative flex h-full w-full items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6">
          {/* Section gauche : Avatar + Rank Badge + Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Rank Badge */}
            {/* {rankStyle.badgeIcon && (
              <div className="relative hidden sm:block">
                <img
                  src={rankStyle.badgeIcon}
                  alt={`${profile.tier} badge`}
                  className="h-20 w-20 opacity-90 drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
                />
              </div>
            )} */}
            {/* Avatar avec bordure colorée selon le rank */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full opacity-60 blur-md"
                style={{ backgroundColor: rankStyle.glowColor }}
              />
              <div
                className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full border-[3px] bg-slate-900/95 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.9)]"
                style={{ borderColor: rankStyle.borderColor }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-slate-200">
                    {avatarFallback}
                  </span>
                )}
              </div>
            </div>

            {/* Info joueur */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                {displayName}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold uppercase tracking-wide sm:text-base"
                  style={{ color: rankStyle.borderColor }}
                >
                  {profile.tier} {profile.rank}
                </span>
                <span className="text-sm text-slate-300/70">•</span>
                <span className="text-sm font-medium text-slate-300/90">
                  {profile.leaguePoints} LP
                </span>
              </div>
              <div className="text-xs text-slate-400/80">
                {totalGames} parties jouées
              </div>
            </div>
          </div>

          {/* Section droite : Stats */}
          <div className="flex flex-col gap-3">
            {/* Winrate avec barre de progression */}
            <div className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 backdrop-blur-sm min-w-[140px]">
              <div className="flex flex-col items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300/70">
                  Winrate
                </span>
                <span className="text-lg font-bold text-white">{winRate}%</span>
              </div>
              {/* Barre de progression */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${winRate}%`,
                    backgroundColor: rankStyle.borderColor,
                  }}
                />
              </div>
            </div>

            {/* Victoires / Défaites */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-3 py-2 backdrop-blur-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-300/70">
                  V
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {profile.wins}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-rose-500/20 bg-rose-950/30 px-3 py-2 backdrop-blur-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-rose-300/70">
                  D
                </span>
                <span className="text-xl font-bold text-rose-400">
                  {profile.losses}
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      {/* Bouton de téléchargement */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 px-4 py-3 font-semibold text-white transition-all hover:from-slate-700/80 hover:to-slate-800/80 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Télécharger la bannière"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        <span>{isDownloading ? "Téléchargement..." : "Télécharger la bannière"}</span>
      </button>
    </section>
  );
}
