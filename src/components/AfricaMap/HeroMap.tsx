import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { africaMapShapes } from '../../data/africaMapShapes'
import { allAfricanCountries } from '../../data/allAfricanCountries'
import './HeroMap.css'

const VIEW_W = 1000
// ponytail: les tracés vont jusqu'à 1140 à cause des îles du Prince-Édouard (Afrique du Sud),
// invisibles à cette échelle ; on cadre sur le continent
const VIEW_H = 940

const countriesById = new Map(allAfricanCountries.map((country) => [country.id, country]))

interface HeroMapProps {
  highlighted?: string[]
}

/**
 * Carte d'aperçu de la page d'accueil : chaque pays mène à sa fiche.
 * Les pays ne sont pas focusables au clavier : la recherche et les raccourcis pays
 * de la page d'accueil en sont l'équivalent accessible.
 */
export const HeroMap = ({ highlighted = [] }: HeroMapProps) => {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const hovered = hoveredId ? countriesById.get(hoveredId) : undefined
  const label = hoveredId ? africaMapShapes[hoveredId]?.label : undefined

  return (
    <div className="hero-map" onPointerLeave={() => setHoveredId(null)}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" focusable="false">
        {Object.entries(africaMapShapes).map(([id, shape]) => (
          <path
            key={id}
            d={shape.path}
            className="hero-map-country"
            data-highlight={highlighted.includes(id) || undefined}
            data-hovered={id === hoveredId || undefined}
            onPointerEnter={() => setHoveredId(id)}
            onClick={() => navigate(`/country/${id.toLowerCase()}`)}
          />
        ))}
      </svg>

      {hovered && label && (
        <span
          className="hero-map-label"
          style={{ left: `${(label[0] / VIEW_W) * 100}%`, top: `${(label[1] / VIEW_H) * 100}%` }}
        >
          {hovered.nameFr}
          <small>{hovered.capital}</small>
        </span>
      )}
    </div>
  )
}
