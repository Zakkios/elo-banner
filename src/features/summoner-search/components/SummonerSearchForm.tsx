import type { FormEventHandler } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'

export interface SummonerSearchFormProps {
  summonerName: string
  onSummonerNameChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isLoading?: boolean
}

export function SummonerSearchForm({ summonerName, onSummonerNameChange, onSubmit, isLoading }: SummonerSearchFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <TextField
        name="summonerName"
        label="Pseudo du joueur"
        placeholder="Ex: Faker"
        value={summonerName}
        onChange={(event) => onSummonerNameChange(event.target.value)}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
      />
      <Button type="submit" disabled={isLoading || summonerName.trim().length === 0}>
        {isLoading ? 'Recherche...' : 'Generer'}
      </Button>
    </form>
  )
}
