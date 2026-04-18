import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { SchematicAfricaMap } from '../AfricaMap/SchematicAfricaMap'
import { CountryDetailPanel } from './CountryDetailPanel'
import {
  allAfricanCountries,
  getCountryRegion,
  type AfricanCountry,
} from '../../data/allAfricanCountries'
import './MapSection.css'

type Region = 'Tous' | 'Nord' | 'Ouest' | 'Est' | 'Centre' | 'Sud'

const REGIONS: Region[] = ['Tous', 'Nord', 'Ouest', 'Est', 'Centre', 'Sud']

export const MapSection = () => {
  const [activeId, setActiveId] = useState<string>('SN')
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [region, setRegion] = useState<Region>('Tous')
  const [query, setQuery] = useState('')

  const countriesById = useMemo(() => {
    const map = new Map<string, AfricanCountry>()
    allAfricanCountries.forEach((c) => map.set(c.id, c))
    return map
  }, [])

  const activeCountry = countriesById.get(activeId) ?? allAfricanCountries[0]

  const dimmedIds = useMemo(() => {
    if (region === 'Tous') return []
    return allAfricanCountries
      .filter((c) => (c.region ?? getCountryRegion(c.id)) !== region)
      .map((c) => c.id)
  }, [region])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return allAfricanCountries
      .filter(
        (c) => c.nameFr.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query])

  return (
    <section id="map" className="section map-section">
      <div className="section-head">
        <div>
          <div className="section-num">01 / Géographie vivante</div>
          <h2 className="section-h2">
            Explorez <em>54 pays</em>, cinq régions, un continent.
          </h2>
        </div>
        <p className="section-lead">
          Survolez la carte pour découvrir chaque nation. Filtrez par région ou cherchez directement
          un pays ou une capitale.
        </p>
      </div>

      <div className="map-chips">
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            className={`map-chip ${region === r ? 'active' : ''}`}
            onClick={() => setRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <div className="map-wrap">
          <div className="map-grid-bg" aria-hidden="true" />
          <SchematicAfricaMap
            activeId={activeId}
            dimmed={dimmedIds}
            onHover={setHoverId}
            onClick={(id) => setActiveId(id)}
          />
          <div className="map-legend">
            <span className="map-legend-dot" />
            <span>Pays actif</span>
            <span className="map-legend-sep">·</span>
            <span>Survol pour explorer</span>
          </div>
          <div className="map-caption">
            {hoverId ? (
              <>
                <span className="map-caption-kicker">Survolé</span>
                <span className="map-caption-name">
                  {countriesById.get(hoverId)?.nameFr ?? hoverId}
                </span>
              </>
            ) : (
              <>
                <span className="map-caption-kicker">Carte schématique</span>
                <span className="map-caption-name">Afrique · 54 pays</span>
              </>
            )}
          </div>
        </div>

        <div className="map-side">
          <div className="map-search">
            <Search size={16} className="map-search-icon" />
            <input
              type="text"
              className="map-search-input"
              placeholder="Rechercher un pays ou une capitale…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="map-search-results">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="map-search-item"
                    onClick={() => {
                      setActiveId(c.id)
                      setQuery('')
                    }}
                  >
                    <span className="map-search-id">{c.id}</span>
                    <span className="map-search-name">{c.nameFr}</span>
                    <span className="map-search-capital">{c.capital}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <CountryDetailPanel country={activeCountry} />
        </div>
      </div>
    </section>
  )
}
