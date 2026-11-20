import './TypeChips.css'

interface TypeChipsProps<T extends string> {
  label: string
  options: ReadonlyArray<{ key: T; label: string }>
  counts: Record<T, number>
  active: T
  onChange: (key: T) => void
}

/** Pastilles de filtre avec compteur (maquette Figma « Puce/Région »). */
export const TypeChips = <T extends string>({ label, options, counts, active, onChange }: TypeChipsProps<T>) => (
  <div className="mbr-chips" role="group" aria-label={label}>
    {options.map(({ key, label: optionLabel }) => (
      <button key={key} type="button" className="mbr-chip" aria-pressed={active === key} onClick={() => onChange(key)}>
        {optionLabel} <span>{counts[key]}</span>
      </button>
    ))}
  </div>
)
