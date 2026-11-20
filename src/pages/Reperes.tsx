import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { RubriqueSection } from '../components/UX/RubriqueSection'
import { TypeChips } from '../components/UX/TypeChips'
import { useTypeFilter } from '../hooks/useTypeFilter'
import { figureService, proverbService, timelineService } from '../services/api'
import { fetchLists, joinMeta } from '../utils'
import './Rubriques.css'

// Repères rassemble trois anciennes rubriques (clean.md) :
// la chronologie (/timeline), les personnalités (/figures) et les proverbes (/proverbs).
type RepereType = 'dates' | 'personnalites' | 'proverbes'

const TYPES = [
  { key: 'tout', label: 'Tout' },
  { key: 'dates', label: 'Dates' },
  { key: 'personnalites', label: 'Personnalités' },
  { key: 'proverbes', label: 'Proverbes' },
] as const

// Année « signée » lue dans la date ISO, sans passer par Date (qui décale les années anciennes).
const yearOf = (iso?: string | null) => {
  const match = iso ? /^([+-]?)(\d{1,6})-/.exec(iso) : null
  if (!match) return undefined
  return match[1] === '-' ? -Number(match[2]) : Number(match[2])
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
  const [events, setEvents] = useState<any[]>([])
  const [figures, setFigures] = useState<any[]>([])
  const [proverbs, setProverbs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setType] = useTypeFilter<RepereType | 'tout'>('tout')

  useEffect(() => {
    let cancelled = false
    fetchLists([
      [timelineService.getAll({ limit: 100 }), 'events'],
      [figureService.getAll({ limit: 100 }), 'figures'],
      [proverbService.getAll({ limit: 100 }), 'proverbs'],
    ]).then(([eventList, figureList, proverbList]) => {
      if (cancelled) return
      setEvents(
        eventList
          .map((event) => ({ ...event, year: eventYear(event) }))
          .filter((event) => event.year !== undefined)
          .sort((a, b) => a.year - b.year)
      )
      setFigures(figureList)
      setProverbs(proverbList)
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

  const shows = (type: RepereType) => !loading && (active === 'tout' || active === type)

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
          <TypeChips label="Type de repère" options={TYPES} counts={counts} active={active} onChange={setType} />
        </div>

        {loading && <p className="mbr-empty">Chargement des repères…</p>}

        {shows('dates') && (
          <RubriqueSection
            id="mbr-dates"
            className="mbr-dates"
            title="Grandes dates"
            subtitle="De l’Égypte des pharaons aux indépendances."
            isEmpty={events.length === 0}
            emptyLabel="Aucune date pour l’instant."
          >
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
          </RubriqueSection>
        )}

        {shows('personnalites') && (
          <RubriqueSection
            id="mbr-people"
            title="Personnalités"
            subtitle="Celles et ceux qui ont marqué l’histoire."
            isEmpty={figures.length === 0}
            emptyLabel="Aucune personnalité pour l’instant."
          >
            <ul className="mbr-people">
              {figures.map((figure) => {
                const image = figure.image || figure.images?.[0]
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
                        <p className="mbr-meta">{joinMeta(figure.birthPlace?.location, lifeSpan(figure))}</p>
                        <h3>{figure.name}</h3>
                        {figure.shortBiography && <p>{figure.shortBiography}</p>}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </RubriqueSection>
        )}

        {shows('proverbes') && (
          <RubriqueSection
            id="mbr-proverbs"
            title="Proverbes"
            subtitle="La sagesse transmise de bouche à oreille."
            isEmpty={proverbs.length === 0}
            emptyLabel="Aucun proverbe pour l’instant."
          >
            <ul className="mbr-proverbs">
              {proverbs.map((proverb) => (
                <li key={proverb._id} className="mbr-proverb">
                  <blockquote>« {proverb.text.replace(/^«\s*|\s*»$/g, '')} »</blockquote>
                  <p className="mbr-meta">{joinMeta(proverb.countryName || proverb.country?.nameFr, proverb.language)}</p>
                </li>
              ))}
            </ul>
          </RubriqueSection>
        )}
      </div>
    </Layout>
  )
}
