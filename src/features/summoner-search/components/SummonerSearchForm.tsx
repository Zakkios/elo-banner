import type { ClipboardEvent, FormEventHandler } from "react";
import { Button } from "../../../components/ui/Button";
import {
  TextField,
  type TextFieldProps,
} from "../../../components/ui/TextField";
import type { ChampionBackgroundOption } from "../services/championBackgrounds";

interface BackgroundSelectProps {
  label: string;
  name: string;
  options: ChampionBackgroundOption[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export interface SummonerSearchFormProps {
  summonerName: string;
  summonerTagline: string;
  selectedBackground: string;
  backgroundOptions: ChampionBackgroundOption[];
  onSummonerNameChange: (value: string) => void;
  onSummonerTaglineChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoading?: boolean;
  isBackgroundLoading?: boolean;
}

function NameInput(props: TextFieldProps) {
  return <TextField {...props} maxLength={16} />;
}

function TaglineInput({ leftAddon, ...props }: TextFieldProps) {
  return <TextField {...props} maxLength={5} leftAddon={leftAddon ?? "#"} />;
}

function BackgroundSelect({
  label,
  name,
  options,
  value,
  onChange,
  isLoading,
}: BackgroundSelectProps) {
  const isDisabled = isLoading || options.length === 0;
  const displayValue = !value && !isDisabled ? "" : value;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-200/80">{label}</span>
      <div className="flex h-12 items-center rounded-[14px] border border-white/10 bg-white/5 px-1">
        <select
          name={name}
          className="h-10 w-full rounded-[10px] border-none bg-transparent px-3 text-base text-white outline-none focus:ring-0"
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          disabled={isDisabled}
        >
          {isLoading ? (
            <option value="" disabled>
              Chargement des champions...
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-slate-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

export function SummonerSearchForm({
  summonerName,
  summonerTagline,
  selectedBackground,
  backgroundOptions,
  onSummonerNameChange,
  onSummonerTaglineChange,
  onBackgroundChange,
  onSubmit,
  isLoading,
  isBackgroundLoading,
}: SummonerSearchFormProps) {
  const isSubmitDisabled =
    isLoading ||
    summonerName.trim().length === 0 ||
    summonerTagline.trim().length === 0;

  function handleSummonerNamePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData("text");

    if (!pastedValue.includes("#")) {
      return;
    }

    const trimmedValue = pastedValue.trim();
    const hashIndex = trimmedValue.indexOf("#");

    if (hashIndex <= 0 || hashIndex === trimmedValue.length - 1) {
      return;
    }

    const namePart = trimmedValue.slice(0, hashIndex).trim();
    const taglinePart = trimmedValue.slice(hashIndex + 1).trim();

    if (!namePart || !taglinePart) {
      return;
    }

    event.preventDefault();

    onSummonerNameChange(namePart);
    onSummonerTaglineChange(taglinePart);
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
      <BackgroundSelect
        label="Arriere-plan"
        name="background"
        options={backgroundOptions}
        value={selectedBackground}
        onChange={onBackgroundChange}
        isLoading={isBackgroundLoading}
      />
      <Button type="submit" disabled={isSubmitDisabled}>
        {isLoading ? "Recherche..." : "Generer"}
      </Button>
    </form>
  );
}
