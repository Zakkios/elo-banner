import { useEffect, useState } from 'react'
import type { ChampionSkinOption } from '../services/championSkins'
import { getChampionSkinOptions } from '../services/championSkins'

interface ChampionSkinState {
  options: ChampionSkinOption[]
  isLoading: boolean
  error: Error | null
}

const INITIAL_STATE: ChampionSkinState = {
  options: [],
  isLoading: false,
  error: null,
}

export function useChampionSkinOptions(championId: string) {
  const [{ options, isLoading, error }, setState] = useState<ChampionSkinState>(INITIAL_STATE)

  useEffect(() => {
    // Reset si pas de champion sélectionné
    if (!championId) {
      setState(INITIAL_STATE)
      return
    }

    let isMounted = true

    setState((previous) => ({ ...previous, isLoading: true, error: null }))

    getChampionSkinOptions(championId)
      .then((fetchedOptions) => {
        if (!isMounted) {
          return
        }

        setState({ options: fetchedOptions, isLoading: false, error: null })
      })
      .catch((cause) => {
        if (!isMounted) {
          return
        }

        const errorInstance = cause instanceof Error ? cause : new Error('Impossible de charger les skins du champion.')
        setState({ options: [], isLoading: false, error: errorInstance })
      })

    return () => {
      isMounted = false
    }
  }, [championId])

  return {
    options,
    isLoading,
    error,
  }
}
