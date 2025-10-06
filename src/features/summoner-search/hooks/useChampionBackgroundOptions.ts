import { useEffect, useState } from 'react'
import type { ChampionBackgroundOption } from '../services/championBackgrounds'
import { getChampionBackgroundOptions } from '../services/championBackgrounds'

interface ChampionBackgroundState {
  options: ChampionBackgroundOption[]
  isLoading: boolean
  error: Error | null
}

const INITIAL_STATE: ChampionBackgroundState = {
  options: [],
  isLoading: true,
  error: null,
}

export function useChampionBackgroundOptions() {
  const [{ options, isLoading, error }, setState] = useState<ChampionBackgroundState>(INITIAL_STATE)

  useEffect(() => {
    let isMounted = true

    setState((previous) => ({ ...previous, isLoading: true }))

    getChampionBackgroundOptions()
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

        const errorInstance = cause instanceof Error ? cause : new Error('Impossible de charger la liste des champions.')
        setState({ options: [], isLoading: false, error: errorInstance })
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    options,
    isLoading,
    error,
  }
}