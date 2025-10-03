import { useMemo, useState, type FormEvent } from 'react'
import { SummonerSearchForm } from './SummonerSearchForm'
import { SummonerResultCard } from './SummonerResultCard'
import type { SummonerProfile, SummonerSearchErrorCode } from '../types'
import { fetchSummonerPreview } from '../services/riotApi'

interface SummonerState {
  profile: SummonerProfile | null
  lastQueriedName?: string
  lastQueriedTagline?: string
  error?: SummonerSearchErrorCode
}

const ERROR_MESSAGES: Record<SummonerSearchErrorCode, string> = {
  'empty-name': 'Veuillez saisir un pseudo avant de lancer une recherche.',
  'empty-tagline': 'Veuillez saisir un tag avant de lancer une recherche.',
  'missing-api-key': 'Cle API manquante. Definissez VITE_RIOT_API_KEY pour activer la recherche Riot.',
  'not-found': "Aucun joueur ne correspond a ce pseudo. Verifiez l'orthographe.",
  'rate-limited': "La limite d'appels a l'API Riot est atteinte. Reessayez dans quelques instants.",
  unauthorized: 'Cle API invalide ou expiree. Generez-en une nouvelle dans le portail Riot.',
  forbidden: "Acces refuse par l'API Riot. Verifiez les droits associes a votre cle.",
  'service-unavailable': 'Le service Riot est momentanement indisponible. Reessayez plus tard.',
  'riot-api-error': "Une erreur inattendue est survenue avec l'API Riot. Veuillez reessayer.",
  'network-error': "Impossible de contacter l'API Riot. Verifiez votre connexion et reessayez.",
}

function sanitizeTaglineInput(rawValue: string): string {
  const alphanumeric = rawValue.replace(/[^\da-zA-Z]/g, '')
  return alphanumeric.slice(0, 5).toUpperCase()
}

export function SummonerSearchSection() {
  const [summonerName, setSummonerName] = useState('')
  const [summonerTagline, setSummonerTagline] = useState('')
  const [state, setState] = useState<SummonerState>({ profile: null })
  const [isLoading, setIsLoading] = useState(false)

  const errorMessage = useMemo(() => {
    if (!state.error) {
      return null
    }

    return ERROR_MESSAGES[state.error] ?? 'Une erreur inattendue est survenue.'
  }, [state.error])

  function handleSummonerNameChange(value: string) {
    setSummonerName(value)
    setState((previous) => (previous.error ? { ...previous, error: undefined } : previous))
  }

  function handleSummonerTaglineChange(value: string) {
    setSummonerTagline(sanitizeTaglineInput(value))
    setState((previous) => (previous.error ? { ...previous, error: undefined } : previous))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = summonerName.trim()
    const normalizedTagline = sanitizeTaglineInput(summonerTagline)

    if (!normalizedName) {
      setState((previous) => ({
        ...previous,
        error: 'empty-name',
      }))
      return
    }

    if (!normalizedTagline) {
      setState((previous) => ({
        ...previous,
        error: 'empty-tagline',
      }))
      return
    }

    setIsLoading(true)

    try {
      const result = await fetchSummonerPreview(normalizedName, normalizedTagline)

      setState({
        profile: result.profile,
        lastQueriedName: normalizedName,
        lastQueriedTagline: normalizedTagline,
        error: result.error,
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Unexpected error while handling summoner search', error)
      }

      setState({
        profile: null,
        lastQueriedName: normalizedName,
        lastQueriedTagline: normalizedTagline,
        error: 'network-error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-5 rounded-3xl border border-app-border bg-app-panel p-8">
        <h2 className="text-2xl font-semibold text-white">Recherche de joueur</h2>
        <p className="text-sm text-slate-200/70">
          Entrez un pseudo League of Legends et son tag pour preparer la generation de la banniere personnalisee basee sur son Elo.
        </p>
        <SummonerSearchForm
          summonerName={summonerName}
          summonerTagline={summonerTagline}
          onSummonerNameChange={handleSummonerNameChange}
          onSummonerTaglineChange={handleSummonerTaglineChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
      </div>
      <SummonerResultCard
        profile={state.profile}
        lastQueriedName={state.lastQueriedName}
        lastQueriedTagline={state.lastQueriedTagline}
        isLoading={isLoading}
      />
    </section>
  )
}
