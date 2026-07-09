import { useMemo, useRef, useState } from 'react'
import { matchesWords } from '../../lib/text'
import type { CriterionListItem } from '../../types'

const MAX_RESULTS = 30

interface CriterionPickerProps {
  criteria: CriterionListItem[]
  value: number | null
  onChange: (criterionId: number | null) => void
}

export default function CriterionPicker({
  criteria,
  value,
  onChange,
}: CriterionPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<number | undefined>(undefined)

  const selected = useMemo(
    () => criteria.find((c) => c.id === value) ?? null,
    [criteria, value],
  )

  const results = useMemo(() => {
    const q = query.trim()
    const matches = q
      ? criteria.filter((c) =>
          matchesWords(`${c.code} ${c.title} ${c.thematic.name}`, q),
        )
      : criteria
    return matches.slice(0, MAX_RESULTS)
  }, [criteria, query])

  if (selected) {
    return (
      <div className="criterion-selected">
        <span className="criterion-chip">{selected.code}</span>
        <span className="criterion-selected-title">{selected.title}</span>
        <button
          type="button"
          className="btn-link"
          onClick={() => {
            onChange(null)
            setQuery('')
          }}
          aria-label="Changer de critère"
        >
          Changer
        </button>
      </div>
    )
  }

  return (
    <div className="criterion-picker">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          window.clearTimeout(blurTimeout.current)
          setOpen(true)
        }}
        onBlur={() => {
          // Delay so a click on an option registers before the list closes.
          blurTimeout.current = window.setTimeout(() => setOpen(false), 150)
        }}
        placeholder="Rechercher un critère… (ex : 3.2, contraste)"
        role="combobox"
        aria-expanded={open}
        aria-controls="criterion-picker-list"
        aria-autocomplete="list"
      />
      {open && (
        <ul className="criterion-picker-list" id="criterion-picker-list" role="listbox">
          {results.length === 0 ? (
            <li className="criterion-picker-empty">Aucun critère trouvé</li>
          ) : (
            results.map((criterion) => (
              <li key={criterion.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  onClick={() => {
                    onChange(criterion.id)
                    setOpen(false)
                  }}
                >
                  <span className="criterion-chip">{criterion.code}</span>
                  <span className="picker-title">{criterion.title}</span>
                  <span className="picker-thematic">{criterion.thematic.name}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
