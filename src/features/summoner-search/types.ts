export interface SummonerProfile {
  name: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  profileIconUrl?: string
  bannerUrl?: string
}

export interface SummonerSearchResult {
  profile: SummonerProfile | null
  error?: string
}
