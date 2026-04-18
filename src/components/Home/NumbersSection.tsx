import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import './NumbersSection.css'

interface NumberCellProps {
  value: number
  suffix?: string
  decimals?: number
  label: string
  unit?: string
  trigger: boolean
}

const formatFr = (n: number, decimals: number): string => {
  const fixed = n.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decPart ? `${withSpaces},${decPart}` : withSpaces
}

const NumberCell = ({ value, suffix = '', decimals = 0, label, unit, trigger }: NumberCellProps) => {
  const current = useCountUp(value, 1800, trigger)
  return (
    <div className="number-cell">
      <div className="number-value">
        {formatFr(current, decimals)}
        {suffix && <span className="number-suffix">{suffix}</span>}
      </div>
      <div className="number-label">{label}</div>
      {unit && <div className="number-unit">{unit}</div>}
    </div>
  )
}

interface NumbersSectionProps {
  stats?: {
    countries?: number
    population?: number
    area?: number
    languages?: number
  }
}

export const NumbersSection = ({ stats }: NumbersSectionProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const countries = stats?.countries ?? 54
  const population = stats?.population ?? 1.4
  const area = stats?.area ?? 30.3
  const languages = stats?.languages ?? 2000

  return (
    <section className="section numbers-section" ref={ref}>
      <div className="section-head">
        <div>
          <div className="section-num">03 / L'Afrique en chiffres</div>
          <h2 className="section-h2">
            Un continent aux <em>dimensions démesurées</em>.
          </h2>
        </div>
        <p className="section-lead">
          Deuxième continent le plus vaste et le plus peuplé, berceau de l'humanité et matrice de
          sa diversité.
        </p>
      </div>

      <div className="numbers-grid">
        <NumberCell value={countries} label="Pays souverains" unit="nations" trigger={visible} />
        <NumberCell
          value={population}
          decimals={1}
          suffix=" Md"
          label="Habitants"
          unit="18 % de la population mondiale"
          trigger={visible}
        />
        <NumberCell
          value={area}
          decimals={1}
          suffix=" M"
          label="km² de superficie"
          unit="20 % des terres émergées"
          trigger={visible}
        />
        <NumberCell
          value={languages}
          suffix="+"
          label="Langues vivantes"
          unit="un quart des langues du monde"
          trigger={visible}
        />
      </div>
    </section>
  )
}
