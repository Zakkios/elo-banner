import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SummonerSearchForm } from "./SummonerSearchForm";
import { SummonerResultCard } from "./SummonerResultCard";
import type { SummonerProfile, SummonerSearchErrorCode } from "../types";
import { fetchSummonerPreview } from "../services/riotApi";
import { useChampionBackgroundOptions } from "../hooks/useChampionBackgroundOptions";
import { useChampionSkinOptions } from "../hooks/useChampionSkinOptions";

interface SummonerState {
  profile: SummonerProfile | null;
  lastQueriedName?: string;
  lastQueriedTagline?: string;
  error?: SummonerSearchErrorCode;
}

const ERROR_MESSAGES: Record<SummonerSearchErrorCode, string> = {
  "empty-name": "Veuillez saisir un pseudo avant de lancer une recherche.",
  "empty-tagline": "Veuillez saisir un tag avant de lancer une recherche.",
  "missing-api-key":
    "Cle API manquante. Definissez VITE_RIOT_API_KEY pour activer la recherche Riot.",
  "not-found":
    "Aucun joueur ne correspond a ce pseudo. Verifiez l'orthographe.",
  "rate-limited":
    "La limite d'appels a l'API Riot est atteinte. Reessayez dans quelques instants.",
  unauthorized:
    "Cle API invalide ou expiree. Generez-en une nouvelle dans le portail Riot.",
  forbidden:
    "Acces refuse par l'API Riot. Verifiez les droits associes a votre cle.",
  "service-unavailable":
    "Le service Riot est momentanement indisponible. Reessayez plus tard.",
  "riot-api-error":
    "Une erreur inattendue est survenue avec l'API Riot. Veuillez reessayer.",
  "network-error":
    "Impossible de contacter l'API Riot. Verifiez votre connexion et reessayez.",
};

function sanitizeTaglineInput(rawValue: string): string {
  const alphanumeric = rawValue.replace(/[^\da-zA-Z]/g, "");
  return alphanumeric.slice(0, 5).toUpperCase();
}

export function SummonerSearchSection() {
  const [summonerName, setSummonerName] = useState("");
  const [summonerTagline, setSummonerTagline] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("0");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [state, setState] = useState<SummonerState>({ profile: null });
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundOffset, setBackgroundOffset] = useState(0);

  const {
    options: backgroundOptions,
    isLoading: isBackgroundLoading,
    error: backgroundError,
  } = useChampionBackgroundOptions();

  const {
    options: skinOptions,
    isLoading: isSkinLoading,
    error: skinError,
  } = useChampionSkinOptions(selectedBackground);

  useEffect(() => {
    if (backgroundOptions.length === 0) {
      return;
    }

    setSelectedBackground((current) => {
      if (
        current &&
        backgroundOptions.some((option) => option.value === current)
      ) {
        return current;
      }

      return backgroundOptions[0].value;
    });
  }, [backgroundOptions]);

  const activeBackground = useMemo(
    () =>
      backgroundOptions.find((option) => option.value === selectedBackground) ??
      null,
    [backgroundOptions, selectedBackground]
  );

  const activeSkin = useMemo(
    () =>
      skinOptions.find((option) => option.value === selectedSkin) ?? null,
    [skinOptions, selectedSkin]
  );

  const previewImageUrl = useMemo(() => {
    if (!hasSubmitted) {
      return undefined;
    }
    // Si un skin est sélectionné et différent du default, utiliser le skin
    if (activeSkin && selectedSkin !== "0") {
      return activeSkin.imageUrl;
    }
    // Sinon utiliser le splash art du champion (skin 0)
    return activeBackground?.imageUrl;
  }, [hasSubmitted, activeSkin, selectedSkin, activeBackground]);

  const errorMessage = useMemo(() => {
    if (!state.error) {
      return null;
    }

    return ERROR_MESSAGES[state.error] ?? "Une erreur inattendue est survenue.";
  }, [state.error]);

  function handleSummonerNameChange(value: string) {
    setSummonerName(value);
    setHasSubmitted(false);
    setState((previous) =>
      previous.error ? { ...previous, error: undefined } : previous
    );
  }

  function handleSummonerTaglineChange(value: string) {
    setSummonerTagline(sanitizeTaglineInput(value));
    setHasSubmitted(false);
    setState((previous) =>
      previous.error ? { ...previous, error: undefined } : previous
    );
  }

  function handleBackgroundChange(value: string) {
    setSelectedBackground(value);
    setSelectedSkin("0"); // Reset au skin par défaut
    setBackgroundOffset(0);
  }

  function handleSkinChange(value: string) {
    setSelectedSkin(value);
    setBackgroundOffset(0); // Reset l'offset quand on change de skin
  }

  function handleBackgroundOffsetChange(offset: number) {
    setBackgroundOffset(offset);
  }

  // Réinitialiser le skin quand les options de skins changent
  useEffect(() => {
    if (skinOptions.length > 0) {
      // Vérifier si le skin sélectionné existe toujours
      const skinExists = skinOptions.some((option) => option.value === selectedSkin);
      if (!skinExists) {
        setSelectedSkin("0");
      }
    }
  }, [skinOptions, selectedSkin]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = summonerName.trim();
    const normalizedTagline = sanitizeTaglineInput(summonerTagline);

    if (!normalizedName) {
      setState((previous) => ({
        ...previous,
        error: "empty-name",
      }));
      return;
    }

    if (!normalizedTagline) {
      setState((previous) => ({
        ...previous,
        error: "empty-tagline",
      }));
      return;
    }

    setHasSubmitted(true);
    setIsLoading(true);

    try {
      const result = await fetchSummonerPreview(
        normalizedName,
        normalizedTagline
      );

      setState({
        profile: result.profile,
        lastQueriedName: normalizedName,
        lastQueriedTagline: normalizedTagline,
        error: result.error,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Unexpected error while handling summoner search", error);
      }

      setState({
        profile: null,
        lastQueriedName: normalizedName,
        lastQueriedTagline: normalizedTagline,
        error: "network-error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="gap-8 flex w-full flex-col">
      <SummonerResultCard
        profile={state.profile}
        lastQueriedName={state.lastQueriedName}
        lastQueriedTagline={state.lastQueriedTagline}
        isLoading={isLoading}
        previewBackgroundUrl={previewImageUrl}
        hasSubmitted={hasSubmitted}
        backgroundOffset={backgroundOffset}
        onBackgroundOffsetChange={handleBackgroundOffsetChange}
      />
      <div className="flex flex-col gap-5 rounded-3xl border border-app-border bg-app-panel p-8">
        <h2 className="text-2xl font-semibold text-white">
          Recherche de joueur
        </h2>
        <p className="text-sm text-slate-200/70">
          Entrez un pseudo League of Legends et son tag pour preparer la
          generation de la banniere personnalisee basee sur son Elo.
        </p>
        <SummonerSearchForm
          summonerName={summonerName}
          summonerTagline={summonerTagline}
          selectedBackground={selectedBackground}
          backgroundOptions={backgroundOptions}
          selectedSkin={selectedSkin}
          skinOptions={skinOptions}
          onSummonerNameChange={handleSummonerNameChange}
          onSummonerTaglineChange={handleSummonerTaglineChange}
          onBackgroundChange={handleBackgroundChange}
          onSkinChange={handleSkinChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isBackgroundLoading={isBackgroundLoading}
          isSkinLoading={isSkinLoading}
        />
        {backgroundError ? (
          <p className="text-sm text-amber-200/80">
            Impossible de charger la liste complete des champions pour le
            moment. Reessayez un peu plus tard.
          </p>
        ) : null}
        {skinError ? (
          <p className="text-sm text-amber-200/80">
            Impossible de charger les skins du champion. Reessayez un peu plus tard.
          </p>
        ) : null}
        {errorMessage ? (
          <p className="text-sm text-rose-300">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
