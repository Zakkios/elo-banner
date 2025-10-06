export interface ChampionBackgroundOption {
  value: string
  label: string
  imageUrl: string
}

let cachedOptions: ChampionBackgroundOption[] | null = null
let inflightRequest: Promise<ChampionBackgroundOption[]> | null = null

async function fetchLatestDataDragonVersion(): Promise<string> {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')

  if (!response.ok) {
    throw new Error('Impossible de recuperer la version la plus recente de Data Dragon.')
  }

  const versions = (await response.json()) as string[]
  const [latestVersion] = versions

  if (!latestVersion) {
    throw new Error('Aucune version Data Dragon disponible.')
  }

  return latestVersion
}

interface ChampionSummary {
  id: string
  name: string
}

interface ChampionListResponse {
  data: Record<string, ChampionSummary>
}

async function fetchChampionSummaries(version: string): Promise<ChampionSummary[]> {
  const url = 'https://ddragon.leagueoflegends.com/cdn/' + version + '/data/en_US/champion.json'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Impossible de recuperer la liste des champions.')
  }

  const payload = (await response.json()) as ChampionListResponse
  return Object.values(payload.data)
}

function toChampionBackgroundOption(summary: ChampionSummary): ChampionBackgroundOption {
  return {
    value: summary.id,
    label: summary.name,
    imageUrl: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + summary.id + '_0.jpg',
  }
}

function sortByLabelAscending<T extends { label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

export async function getChampionBackgroundOptions(): Promise<ChampionBackgroundOption[]> {
  if (cachedOptions) {
    return cachedOptions
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightRequest = (async () => {
    const version = await fetchLatestDataDragonVersion()
    const summaries = await fetchChampionSummaries(version)
    const options = sortByLabelAscending(summaries.map(toChampionBackgroundOption))
    cachedOptions = options
    return options
  })()

  try {
    return await inflightRequest
  } finally {
    inflightRequest = null
  }
}
