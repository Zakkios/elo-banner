import type { ClipboardEvent, FormEventHandler } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextField, type TextFieldProps } from '../../../components/ui/TextField'

export interface SummonerSearchFormProps {
  summonerName: string
  summonerTagline: string
  onSummonerNameChange: (value: string) => void
  onSummonerTaglineChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  isLoading?: boolean
}

function NameInput(props: TextFieldProps) {
  return <TextField {...props} maxLength={16} />
}

function TaglineInput({ leftAddon, ...props }: TextFieldProps) {
  return <TextField {...props} maxLength={5} leftAddon={leftAddon ?? '#'} />
}

export function SummonerSearchForm({
  summonerName,
  summonerTagline,
  onSummonerNameChange,
  onSummonerTaglineChange,
  onSubmit,
  isLoading,
}: SummonerSearchFormProps) {
  const isSubmitDisabled =
    isLoading || summonerName.trim().length === 0 || summonerTagline.trim().length === 0

  function handleSummonerNamePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData('text')

    if (!pastedValue.includes('#')) {
      return
    }

    const trimmedValue = pastedValue.trim()
    const hashIndex = trimmedValue.indexOf('#')

    if (hashIndex <= 0 || hashIndex === trimmedValue.length - 1) {
      return
    }

    const namePart = trimmedValue.slice(0, hashIndex).trim()
    const taglinePart = trimmedValue.slice(hashIndex + 1).trim()

    if (!namePart || !taglinePart) {
      return
    }

    event.preventDefault()

    onSummonerNameChange(namePart)
    onSummonerTaglineChange(taglinePart)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
        <NameInput
          name="summonerName"
          label="Pseudo"
          placeholder="Ex: Faker"
          value={summonerName}
          onChange={(event) => onSummonerNameChange(event.target.value)}
          onPaste={handleSummonerNamePaste}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          className="sm:flex-[0.68]"
        />
        <TaglineInput
          name="tagline"
          label="Tag"
          placeholder="EUW"
          value={summonerTagline}
          onChange={(event) => onSummonerTaglineChange(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          className="sm:flex-[0.32]"
        />
      </div>
      <Button type="submit" disabled={isSubmitDisabled}>
        {isLoading ? 'Recherche...' : 'Generer'}
      </Button>
    </form>
  )
}
