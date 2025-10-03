import type { SummonerProfile, SummonerSearchResult } from '../types'

const sampleProfiles: Record<string, SummonerProfile> = {
  faker: {
    name: 'Faker',
    tier: 'Challenger',
    rank: 'I',
    leaguePoints: 1234,
    wins: 999,
    losses: 123,
    profileIconUrl: undefined,
    bannerUrl: undefined,
  },
  caps: {
    name: 'Caps',
    tier: 'Grandmaster',
    rank: 'I',
    leaguePoints: 820,
    wins: 740,
    losses: 410,
    profileIconUrl: undefined,
    bannerUrl: undefined,
  },
}

const tiers = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master']

export async function fetchSummonerPreview(summonerName: string): Promise<SummonerSearchResult> {
  const trimmedName = summonerName.trim()

  if (!trimmedName) {
    return { profile: null, error: 'empty-name' }
  }

  // lightweight delay to simulate a network request
  await new Promise((resolve) => setTimeout(resolve, 400))

  const profileFromSamples = sampleProfiles[trimmedName.toLowerCase()]

  if (profileFromSamples) {
    return { profile: profileFromSamples }
  }

  const pseudoRandom = trimmedName.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const tierIndex = pseudoRandom % tiers.length
  const leaguePoints = 50 + (pseudoRandom % 75)
  const wins = 10 + (pseudoRandom % 90)
  const losses = Math.floor(wins * 0.6)

  const generatedProfile: SummonerProfile = {
    name: trimmedName,
    tier: tiers[tierIndex],
    rank: 'IV',
    leaguePoints,
    wins,
    losses,
    profileIconUrl: undefined,
    bannerUrl: undefined,
  }

  return { profile: generatedProfile }
}
