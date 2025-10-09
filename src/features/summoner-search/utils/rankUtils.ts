export interface RankStyle {
  borderColor: string
  glowColor: string
  textColor: string
  badgeIcon: string
  wingsIcon: string
}

const RANK_STYLES: Record<string, RankStyle> = {
  IRON: {
    borderColor: '#4A4A4A',
    glowColor: 'rgba(74, 74, 74, 0.5)',
    textColor: '#6B7280',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/iron.png',
    wingsIcon: '/assets/wings/Iron.png',
  },
  BRONZE: {
    borderColor: '#8B5A3C',
    glowColor: 'rgba(139, 90, 60, 0.5)',
    textColor: '#92400E',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/bronze.png',
    wingsIcon: '/assets/wings/Bronze.png',
  },
  SILVER: {
    borderColor: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.5)',
    textColor: '#475569',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/silver.png',
    wingsIcon: '/assets/wings/Silver.png',
  },
  GOLD: {
    borderColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: '#D97706',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/gold.png',
    wingsIcon: '/assets/wings/Gold.png',
  },
  PLATINUM: {
    borderColor: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    textColor: '#0891B2',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/platinum.png',
    wingsIcon: '/assets/wings/Platinum.png',
  },
  EMERALD: {
    borderColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    textColor: '#059669',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/emerald.png',
    wingsIcon: '/assets/wings/Emerald.png',
  },
  DIAMOND: {
    borderColor: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    textColor: '#7C3AED',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/diamond.png',
    wingsIcon: '/assets/wings/Diamond.png',
  },
  MASTER: {
    borderColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    textColor: '#DB2777',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/master.png',
    wingsIcon: '/assets/wings/Master.png',
  },
  GRANDMASTER: {
    borderColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    textColor: '#DC2626',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/grandmaster.png',
    wingsIcon: '/assets/wings/Grand.png',
  },
  CHALLENGER: {
    borderColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    textColor: '#2563EB',
    badgeIcon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/challenger.png',
    wingsIcon: '/assets/wings/Challenger.png',
  },
}

const DEFAULT_RANK_STYLE: RankStyle = {
  borderColor: '#64748B',
  glowColor: 'rgba(100, 116, 139, 0.5)',
  textColor: '#94A3B8',
  badgeIcon: '',
  wingsIcon: '',
}

export function getRankStyle(tier?: string): RankStyle {
  if (!tier) {
    return DEFAULT_RANK_STYLE
  }

  const normalizedTier = tier.toUpperCase()
  return RANK_STYLES[normalizedTier] || DEFAULT_RANK_STYLE
}

export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) {
    return 0
  }
  return Math.round((wins / total) * 100)
}

export function formatWinRate(wins: number, losses: number): string {
  const winRate = calculateWinRate(wins, losses)
  return `${winRate}%`
}

export function getTotalGames(wins: number, losses: number): number {
  return wins + losses
}
