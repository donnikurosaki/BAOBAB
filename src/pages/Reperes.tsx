import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { figureService, proverbService, timelineService } from '../services/api'
import './Rubriques.css'

// Repères rassemble trois anciennes rubriques (clean.md) :
// la chronologie (/timeline), les personnalités (/figures) et les proverbes (/proverbs).
type RepereType = 'dates' | 'personnalites' | 'proverbes'

const TYPES: Array<{ key: RepereType | 'tout'; label: string }> = [
  { key: 'tout', label: 'Tout' },
  { key: 'dates', label: 'Dates' },
  { key: 'personnalites', label: 'Personnalités' },
  { key: 'proverbes', label: 'Proverbes' },
]

const toList = (data: unknown, key: string): any[] => {
  if (Array.isArray(data)) return data
  const record = data as Record<string, unknown> | null
  const list = record?.[key] ?? record?.data
  return Array.isArray(list) ? list : []
}

// Année « signée » lue dans la date ISO, sans passer par Date (qui décale les années anciennes).
const yearOf = (iso?: string | null) => {
  if (!iso) return undefined
  const match = /^([+-]?)(\d{1,6})-/.exec(iso)
  if (!match) return undefined
  const year = Number(match[2])
  return match[1] === '-' ? -year : year
}

const formatYear = (year: number) => (year < 0 ? `${-year} av. J.-C.` : String(year))

// Les dates avant notre ère sont enregistrées en positif dans la base (bug d'import, voir clean.md).
// En attendant la correction des données : une date « Antiquité » postérieure à l'an 1000 est avant J.-C.
const eventYear = (event: any) => {
  const year = yearOf(event.date)
  if (year === undefined) return undefined
  return event.period === 'Antiquité' && year > 1000 ? -year : year
}

// Même bug pour les personnalités : une naissance après la mort signifie des années avant J.-C.
const lifeSpan = (figure: any) => {
  const birth = yearOf(figure.birthDate)
  const death = yearOf(figure.deathDate)
  if (birth === undefined) return undefined
  if (death === undefined) return `Né en ${formatYear(birth)}`
  return birth > death ? `${birth} – ${death} av. J.-C.` : `${birth} – ${death}`
}

export const Reperes = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState<any[]>([])
  const [figures, setFigures] = useState<any[]>([])
  const [proverbs, setProverbs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const active = (searchParams.get('type') as RepereType | null) ?? 'tout'

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      timelineService.getAll({ limit: 100 }),
      figureService.getAll({ limit: 100 }),
      proverbService.getAll({ limit: 100 }),
    ]).then(([t, f, p]) => {
      if (cancelled) return
      const value = (result: PromiseSettledResult<any>, key: string) =>
        result.status === 'fulfilled' ? toList(result.value.data, key) : []
      setEvents(
        value(t, 'events')
          .map((event) => ({ ...event, year: eventYear(event) }))
          .filter((event) => event.year !== undefined)
          .sort((a, b) => a.year - b.year)
      )
      setFigures(value(f, 'figures'))
      setProverbs(value(p, 'proverbs'))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(
    () => ({
      tout: events.length + figures.length + proverbs.length,
      dates: events.length,
      personnalites: figures.length,
      proverbes: proverbs.length,
    }),
    [events, figures, proverbs]
  )

  const shows = (key: RepereType) => active === 'tout' || active === key

  const setType = (key: RepereType | 'tout') => {
    const next = new URLSearchParams(searchParams)
    if (key === 'tout') next.delete('type')
    else next.set('type', key)
    setSearchParams(next, { replace: true })
  }

  return (
    <Layout>
      <div className="mbr">
        <header className="mbr-intro">
          <div>
            <p className="mbr-eyebrow">Repères</p>
            <h1>Les dates, les figures et les paroles</h1>
          </div>
          <p>
            Les grands moments du continent, celles et ceux qui les ont portés, et la sagesse transmise de bouche à
            oreille.
          </p>
        </header>

        <div className="mbr-filters">
          <div className="mbr-chips" role="group" aria-label="Type de repère">
            {TYPES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="mbr-chip"
                aria-pressed={active === key}
                onClick={() => setType(key)}
              >
                {label} <span>{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="mbr-empty">Chargement des repères…</p>}

        {!loading && shows('dates') && (
          <section className="mbr-section mbr-dates" aria-labelledby="mbr-dates">
            <div className="mbr-section-head">
              <div>
                <h2 id="mbr-dates">Grandes dates</h2>
                <p>De l’Égypte des pharaons aux indépendances.</p>
              </div>
            </div>
            {events.length === 0 ? (
              <p className="mbr-empty">Aucune date pour l’instant.</p>
            ) : (
              <ol className="mbr-timeline">
                {events.map((event) => (
                  <li key={event._id}>
                    <Link to={`/timeline/${event._id}`}>
                      <strong>{formatYear(event.year)}</strong>
                    </Link>
                    <span>{event.title}</span>
                    {event.location?.region && <small>{event.location.region}</small>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {!loading && shows('personnalites') && (
          <section className="mbr-section" aria-labelledby="mbr-people">
            <div className="mbr-section-head">
              <div>
                <h2 id="mbr-people">Personnalités</h2>
                <p>Celles et ceux qui ont marqué l’histoire.</p>
              </div>
            </div>
            {figures.length === 0 ? (
              <p className="mbr-empty">Aucune personnalité pour l’instant.</p>
            ) : (
              <ul className="mbr-people">
                {figures.map((figure) => {
                  const image = figure.image || figure.images?.[0]
                  const place = figure.birthPlace?.location
                  return (
                    <li key={figure._id}>
                      <Link to={`/figures/${figure._id}`} className="mbr-person">
                        <div
                          className="mbr-person-media"
                          style={image ? { backgroundImage: `url(${image})` } : undefined}
                          aria-hidden="true"
                        >
                          {!image && <UserRound size={40} strokeWidth={1.5} />}
                        </div>
                        <div className="mbr-person-body">
                          <p className="mbr-meta">{[place, lifeSpan(figure)].filter(Boolean).join(' · ')}</p>
                          <h3>{figure.name}</h3>
                          {figure.shortBiography && <p>{figure.shortBiography}</p>}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}

        {!loading && shows('proverbes') && (
          <section className="mbr-section" aria-labelledby="mbr-proverbs">
            <div className="mbr-section-head">
              <div>
                <h2 id="mbr-proverbs">Proverbes</h2>
                <p>La sagesse transmise de bouche à oreille.</p>
              </div>
            </div>
            {proverbs.length === 0 ? (
              <p className="mbr-empty">Aucun proverbe pour l’instant.</p>
            ) : (
              <ul className="mbr-proverbs">
                {proverbs.map((proverb) => (
                  <li key={proverb._id} className="mbr-proverb">
                    <blockquote>« {proverb.text.replace(/^«\s*|\s*»$/g, '')} »</blockquote>
                    <p className="mbr-meta">
                      {[proverb.countryName || proverb.country?.nameFr, proverb.language].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Layout>
  )
}
