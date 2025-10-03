import { useState, type FormEvent } from 'react'
import { SummonerSearchForm } from './SummonerSearchForm'
import { SummonerResultCard } from './SummonerResultCard'
import type { SummonerProfile } from '../types'
import { fetchSummonerPreview } from '../services/localPreview'

interface SummonerState {
  profile: SummonerProfile | null
  lastQueriedName?: string
  error?: string
}

export function SummonerSearchSection() {
  const [summonerName, setSummonerName] = useState('')
  const [state, setState] = useState<SummonerState>({ profile: null })
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!summonerName.trim()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await fetchSummonerPreview(summonerName)

      setState({
        profile: result.profile,
        lastQueriedName: summonerName,
        error: result.error,
      })
    } catch (error) {
      setState({
        profile: null,
        lastQueriedName: summonerName,
        error: error instanceof Error ? error.message : 'unknown-error',
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
          Entrez un pseudo League of Legends pour preparer la generation de la banniere personnalisee basee sur son Elo.
        </p>
        <SummonerSearchForm
          summonerName={summonerName}
          onSummonerNameChange={setSummonerName}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {state.error ? (
          <p className="text-sm text-rose-300">Une erreur est survenue. Veuillez reessayer.</p>
        ) : null}
      </div>
      <SummonerResultCard profile={state.profile} lastQueriedName={state.lastQueriedName} isLoading={isLoading} />
    </section>
  )
}
