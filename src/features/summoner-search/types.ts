export interface SummonerProfile {
  name: string
  tagLine?: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  profileIconUrl?: string
  bannerUrl?: string
}

export type SummonerSearchErrorCode =
  | 'empty-name'
  | 'empty-tagline'
  | 'missing-api-key'
  | 'not-found'
  | 'rate-limited'
  | 'unauthorized'
  | 'forbidden'
  | 'service-unavailable'
  | 'riot-api-error'
  | 'network-error'

export interface SummonerSearchResult {
  profile: SummonerProfile | null
  error?: SummonerSearchErrorCode
}
