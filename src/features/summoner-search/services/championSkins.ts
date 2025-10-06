export interface ChampionSkin {
  id: string;
  num: number;
  name: string;
  splashUrl: string;
}

export interface ChampionSkinOption {
  value: string;
  label: string;
  imageUrl: string;
}

let versionCache: string | null = null;
const championDataCache = new Map<string, ChampionSkin[]>();

async function fetchLatestDataDragonVersion(): Promise<string> {
  if (versionCache) {
    return versionCache;
  }

  const response = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de recuperer la version la plus recente de Data Dragon."
    );
  }

  const versions = (await response.json()) as string[];
  const [latestVersion] = versions;

  if (!latestVersion) {
    throw new Error("Aucune version Data Dragon disponible.");
  }

  versionCache = latestVersion;
  return latestVersion;
}

interface ChampionSkinData {
  id: string;
  num: number;
  name: string;
}

interface ChampionDetailResponse {
  data: {
    [key: string]: {
      id: string;
      skins: ChampionSkinData[];
    };
  };
}

async function fetchChampionSkins(championId: string): Promise<ChampionSkin[]> {
  // Vérifier le cache
  if (championDataCache.has(championId)) {
    return championDataCache.get(championId)!;
  }

  const version = await fetchLatestDataDragonVersion();
  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${championId}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Impossible de recuperer les skins pour ${championId}.`);
  }

  const payload = (await response.json()) as ChampionDetailResponse;
  const championData = payload.data[championId];

  if (!championData) {
    throw new Error(`Donnees du champion ${championId} introuvables.`);
  }

  const skins: ChampionSkin[] = championData.skins.map((skin) => ({
    id: skin.id,
    num: skin.num,
    name: skin.name,
    splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`,
  }));

  // Mettre en cache
  championDataCache.set(championId, skins);

  return skins;
}

function toChampionSkinOption(skin: ChampionSkin): ChampionSkinOption {
  return {
    value: String(skin.num),
    label: skin.name === "default" ? "Original" : skin.name,
    imageUrl: skin.splashUrl,
  };
}

export async function getChampionSkinOptions(
  championId: string
): Promise<ChampionSkinOption[]> {
  if (!championId) {
    return [];
  }

  const skins = await fetchChampionSkins(championId);
  return skins.map(toChampionSkinOption);
}
