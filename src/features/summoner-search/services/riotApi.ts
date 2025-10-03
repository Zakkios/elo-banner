import type {
  SummonerProfile,
  SummonerSearchErrorCode,
  SummonerSearchResult,
} from "../types";

const REGIONAL_ROUTING_MAP: Record<
  string,
  "americas" | "europe" | "asia" | "sea"
> = {
  br1: "americas",
  eun1: "europe",
  euw1: "europe",
  jp1: "asia",
  kr: "asia",
  la1: "americas",
  la2: "americas",
  na1: "americas",
  oc1: "americas",
  tr1: "europe",
  ru: "europe",
  pbe1: "americas",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea",
};

const RIOT_PLATFORM_REGION = "euw1";
const RIOT_API_BASE_URL = `https://${RIOT_PLATFORM_REGION}.api.riotgames.com`;
const RIOT_REGIONAL_ROUTING = resolveRegionalRouting(RIOT_PLATFORM_REGION);
const RIOT_REGIONAL_API_BASE_URL = `https://${RIOT_REGIONAL_ROUTING}.api.riotgames.com`;
const QUEUE_PRIORITY: ReadonlyArray<string> = [
  "RANKED_SOLO_5x5",
  "RANKED_FLEX_SR",
  "RANKED_FLEX_TT",
];
const DDRAGON_VERSIONS_URL =
  "https://ddragon.leagueoflegends.com/api/versions.json";
const DDRAGON_CDN_BASE = "https://ddragon.leagueoflegends.com/cdn";

let ddragonVersionResolution: Promise<string | null> | null = null;
let cachedDdragonVersion: string | null = null;

interface RiotSummonerDTO {
  id: string;
  puuid: string;
  name: string;
  profileIconId: number;
}

interface RiotAccountDTO {
  puuid: string;
  gameName?: string;
  tagLine?: string;
}

interface RiotLeagueEntryDTO {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

class RiotApiError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Riot API responded with status ${status}`);
    this.name = "RiotApiError";
    this.status = status;
  }
}

interface SummonerQuery {
  gameName: string;
  tagLine?: string;
}

function resolveRegionalRouting(
  platformRegion: string
): "americas" | "europe" | "asia" | "sea" {
  return REGIONAL_ROUTING_MAP[platformRegion] ?? "americas";
}

function readApiKey(): string | null {
  const key = import.meta.env.VITE_RIOT_API_KEY;
  if (typeof key !== "string") {
    return null;
  }

  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTagLine(value?: string | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.toUpperCase();
}

function parseSummonerQuery(raw: string): SummonerQuery {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { gameName: "" };
  }

  const [gameNamePart, tagLinePart] = trimmed
    .split("#", 2)
    .map((part) => part.trim());

  return tagLinePart
    ? { gameName: gameNamePart, tagLine: normalizeTagLine(tagLinePart) }
    : { gameName: gameNamePart };
}

function createSummonerQuery(
  gameName: string,
  tagLine?: string
): SummonerQuery {
  const normalizedName = gameName.trim();
  const normalizedTag = normalizeTagLine(tagLine);

  if (normalizedTag) {
    return { gameName: normalizedName, tagLine: normalizedTag };
  }

  return parseSummonerQuery(normalizedName);
}

async function fetchDdragonVersion(): Promise<string | null> {
  if (cachedDdragonVersion) {
    return cachedDdragonVersion;
  }

  if (!ddragonVersionResolution) {
    ddragonVersionResolution = fetch(DDRAGON_VERSIONS_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load DDragon versions (status ${response.status})`
          );
        }

        const versions = (await response.json()) as string[];
        return Array.isArray(versions) && versions.length > 0
          ? versions[0]
          : null;
      })
      .catch(() => null)
      .finally(() => {
        ddragonVersionResolution = null;
      });
  }

  const result = await ddragonVersionResolution;
  if (result) {
    cachedDdragonVersion = result;
  }
  return result;
}

async function buildProfileIconUrl(
  profileIconId: number
): Promise<string | undefined> {
  if (!Number.isFinite(profileIconId)) {
    return undefined;
  }

  const version = await fetchDdragonVersion();
  if (!version) {
    return undefined;
  }

  return `${DDRAGON_CDN_BASE}/${version}/img/profileicon/${profileIconId}.png`;
}

function selectPreferredQueue(
  entries: RiotLeagueEntryDTO[]
): RiotLeagueEntryDTO | undefined {
  for (const queue of QUEUE_PRIORITY) {
    const match = entries.find((entry) => entry.queueType === queue);
    if (match) {
      return match;
    }
  }
  return entries[0];
}

function formatTierLabel(value: string | undefined): string {
  if (!value) {
    return "Non classe";
  }

  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function mapStatusToError(status: number): SummonerSearchErrorCode {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    case 429:
      return "rate-limited";
    case 500:
    case 502:
    case 503:
    case 504:
      return "service-unavailable";
    default:
      return "riot-api-error";
  }
}

async function riotFetch<T>(
  baseUrl: string,
  path: string,
  apiKey: string,
  init?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "X-Riot-Token": apiKey,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new RiotApiError(
      response.status,
      init?.method ? `${init.method} ${url} failed` : `GET ${url} failed`
    );
  }

  return (await response.json()) as T;
}

const riotFetchPlatform = <T>(
  path: string,
  apiKey: string,
  init?: RequestInit
) => riotFetch<T>(RIOT_API_BASE_URL, path, apiKey, init);

const riotFetchRegional = <T>(
  path: string,
  apiKey: string,
  init?: RequestInit
) => riotFetch<T>(RIOT_REGIONAL_API_BASE_URL, path, apiKey, init);

async function fetchLeagueEntries(
  summoner: RiotSummonerDTO,
  apiKey: string
): Promise<RiotLeagueEntryDTO[]> {
  try {
    return await riotFetchPlatform<RiotLeagueEntryDTO[]>(
      `/lol/league/v4/entries/by-puuid/${encodeURIComponent(summoner.puuid)}`,
      apiKey
    );
  } catch (error) {
    if (
      error instanceof RiotApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      try {
        return await riotFetchPlatform<RiotLeagueEntryDTO[]>(
          `/lol/league/v4/entries/by-summoner/${encodeURIComponent(
            summoner.id
          )}`,
          apiKey
        );
      } catch (innerError) {
        if (innerError instanceof RiotApiError && innerError.status === 404) {
          return [];
        }
        throw innerError;
      }
    }

    if (error instanceof RiotApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function fetchSummonerPreview(
  gameName: string,
  tagLine?: string
): Promise<SummonerSearchResult> {
  const apiKey = readApiKey();
  if (!apiKey) {
    return { profile: null, error: "missing-api-key" };
  }

  const query = createSummonerQuery(gameName, tagLine);
  if (!query.gameName) {
    return { profile: null, error: "empty-name" };
  }

  if (typeof tagLine === "string" && !query.tagLine) {
    return { profile: null, error: "empty-tagline" };
  }

  try {
    let account: RiotAccountDTO | null = null;
    let summoner: RiotSummonerDTO;

    if (query.tagLine) {
      account = await riotFetchRegional<RiotAccountDTO>(
        `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          query.gameName
        )}/${encodeURIComponent(query.tagLine)}`,
        apiKey
      );
      summoner = await riotFetchPlatform<RiotSummonerDTO>(
        `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(
          account.puuid
        )}`,
        apiKey
      );
    } else {
      summoner = await riotFetchPlatform<RiotSummonerDTO>(
        `/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
          query.gameName
        )}`,
        apiKey
      );
      account = { puuid: summoner.puuid, gameName: summoner.name };
    }

    const [leagueEntries, profileIconUrl] = await Promise.all([
      fetchLeagueEntries(summoner, apiKey),
      buildProfileIconUrl(summoner.profileIconId),
    ]);

    const preferredQueue = selectPreferredQueue(leagueEntries);
    const profile: SummonerProfile = {
      name: account?.gameName ?? summoner.name,
      tagLine: account?.tagLine,
      tier: formatTierLabel(preferredQueue?.tier),
      rank: preferredQueue?.rank ?? "",
      leaguePoints: preferredQueue?.leaguePoints ?? 0,
      wins: preferredQueue?.wins ?? 0,
      losses: preferredQueue?.losses ?? 0,
      profileIconUrl,
      bannerUrl: undefined,
    };

    return { profile };
  } catch (error) {
    if (error instanceof RiotApiError) {
      return { profile: null, error: mapStatusToError(error.status) };
    }

    if (error instanceof Error && error.name === "AbortError") {
      return { profile: null, error: "network-error" };
    }

    if (import.meta.env.DEV) {
      console.error("Unexpected error while fetching summoner preview", error);
    }

    return { profile: null, error: "network-error" };
  }
}
