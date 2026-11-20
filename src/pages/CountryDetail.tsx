import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BookmarkButton } from '../components/BookmarkButton/BookmarkButton'
import { ShareButton } from '../components/ShareButton/ShareButton'
import { Breadcrumbs } from '../components/UX/Breadcrumbs'
import { RubriqueSection } from '../components/UX/RubriqueSection'
import { TypeChips } from '../components/UX/TypeChips'
import { useParamState } from '../hooks/useParamState'
import { countryService, searchService, sourceService } from '../services/api'
import { getCountryById as getStaticCountry } from '../data/allAfricanCountries'
import { getCountryDiscoveryDefault, type CountryDiscoveryDefault } from '../data/countryDiscoveryDefaults'
import { getCountryMapPlaces } from '../data/countryMapPlaces'
import { joinMeta, listFrom } from '../utils'
import './Rubriques.css'
import './CountryDetail.css'

// Fiche pays en 4 onglets (clean.md, maquette Figma « Fiche pays / Desktop 1440 »).
// Chaque information n'apparaît qu'une fois.

type Country = CountryDiscoveryDefault & {
  _id: string
  id: string
  nameFr: string
  capital: string
  population: string
  area: string
  languages: string[]
  currency: string
  description: string
  images?: Array<{ url: string; caption?: string }>
  pdfs?: Array<{ url: string; title: string }>
  videos?: Array<{ url: string; title: string }>
  documents?: Array<{ url: string; title: string }>
}

type Tab = 'reperes' | 'culture' | 'memoire' | 'sources'

const TABS = [
  { key: 'reperes', label: 'Repères' },
  { key: 'culture', label: 'Culture' },
  { key: 'memoire', label: 'Mémoire' },
  { key: 'sources', label: 'Sources' },
] as const

const PLACE_TYPES: Record<string, string> = {
  capital: 'Capitale',
  economic: 'Économie',
  historic: 'Histoire',
  cultural: 'Culture',
  natural: 'Nature',
  port: 'Port',
}

const isEmpty = (value: unknown) => value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

// La base est encore peu remplie : chaque champ vide prend la valeur rédigée dans countryDiscoveryDefaults.
const withDefaults = (country: Country): Country => {
  const defaults = getCountryDiscoveryDefault(country.id) as Record<string, unknown>
  const merged: Record<string, unknown> = { ...country }
  for (const [key, value] of Object.entries(defaults)) if (isEmpty(merged[key])) merged[key] = value
  return merged as unknown as Country
}

const fromStatic = (id: string): Country | null => {
  const staticCountry = getStaticCountry(id.toUpperCase())
  return staticCountry ? ({ ...staticCountry, _id: staticCountry.id, languages: staticCountry.languages || [] } as Country) : null
}

const loadCountry = async (id: string) => {
  try {
    const { data } = await countryService.getById(id)
    if (data) return withDefaults(data)
  } catch {
    // Pays absent de la base : on se rabat sur le catalogue statique
  }
  const fallback = fromStatic(id)
  return fallback ? withDefaults(fallback) : null
}

/** Liste de pastilles, utilisée par plusieurs sections de la fiche. */
const TagList = ({ items }: { items: string[] }) => (
  <ul className="mbp-tags">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

export const CountryDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState<any[]>([])
  const [proverbs, setProverbs] = useState<any[]>([])
  const [tab, setTab] = useParamState<Tab>('onglet', 'reperes')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadCountry(id).then((result) => {
      if (cancelled) return
      setCountry(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!country) return
    let cancelled = false
    Promise.all([
      sourceService.getAll({ country: country.id, limit: 6, minReliability: 3 }).then((r) => listFrom(r.data, 'sources')).catch(() => []),
      searchService.search({ q: country.nameFr, limit: 6 }).then((r) => listFrom(r.data?.proverbs, 'proverbs')).catch(() => []),
    ]).then(([sourceList, proverbList]) => {
      if (cancelled) return
      setSources(sourceList)
      setProverbs(proverbList)
    })
    return () => {
      cancelled = true
    }
  }, [country])

  // Contenu de chaque onglet : une liste de sections, rendues par le même gabarit.
  const content = useMemo(() => {
    if (!country) return null
    const places = getCountryMapPlaces(country.id, country.capital)
    const media = [...(country.pdfs ?? []), ...(country.documents ?? []), ...(country.videos ?? [])].filter((m) => m?.url)
    return {
      reperes: { places, experiences: country.experiences ?? [], facts: country.keyFacts ?? [] },
      culture: [
        { title: 'Savoir-faire et arts', items: [...(country.arts ?? []), ...(country.musicAndArts ?? [])] },
        { title: 'À table', items: [...(country.foods ?? []), ...(country.foodCulture ?? [])] },
        { title: 'Fêtes et rendez-vous', items: country.festivals ?? [] },
        { title: 'Traditions', items: country.traditions ?? [] },
      ],
      memoire: [
        { title: 'Usages à transmettre', items: [...(country.customs ?? []), ...(country.knowledgeToPreserve ?? [])] },
        { title: 'Rites et cérémonies', items: country.rites ?? [] },
        { title: 'Traditions orales', items: country.oralTraditions ?? [] },
        { title: 'Histoire', items: country.historyHighlights ?? [] },
        { title: 'Figures', items: country.notableFigures ?? [] },
      ],
      notes: country.sourceNotes ?? [],
      media,
    }
  }, [country])

  if (loading) {
    return (
      <Layout>
        <p className="mbr-empty">Chargement de la fiche…</p>
      </Layout>
    )
  }

  if (!country || !content) {
    return (
      <Layout>
        <div className="mbr">
          <p className="mbr-empty">
            Ce pays n’a pas encore de fiche. <Link to="/map">Revenir à la carte</Link>
          </p>
        </div>
      </Layout>
    )
  }

  const count = (sections: Array<{ items: string[] }>) => sections.reduce((total, section) => total + section.items.length, 0)
  const counts: Record<Tab, number> = {
    reperes: content.reperes.places.length + content.reperes.experiences.length + content.reperes.facts.length,
    culture: count(content.culture),
    memoire: count(content.memoire) + proverbs.length,
    sources: sources.length + content.notes.length + content.media.length,
  }

  const renderSections = (sections: Array<{ title: string; items: string[] }>) =>
    sections
      .filter((section) => section.items.length > 0)
      .map((section, index) => (
        <RubriqueSection key={section.title} id={`mbp-${tab}-${index}`} title={section.title}>
          <TagList items={section.items} />
        </RubriqueSection>
      ))

  const facts = [
    ['Capitale', country.capital],
    ['Population', country.population],
    ['Superficie', country.area],
    ['Langues', country.languages.join(', ')],
    ['Monnaie', country.currency],
    ['Indicatif', country.callingCode],
  ].filter(([, value]) => value)

  const images = (country.images ?? []).filter((image) => image?.url).slice(0, 3)

  return (
    <Layout>
      <div className="mbr">
        <Breadcrumbs items={[{ label: 'Explorer', to: '/map' }, { label: country.nameFr }]} />

        {images.length > 0 && (
          <div className="mbp-gallery" data-count={images.length}>
            {images.map((image) => (
              <img key={image.url} src={image.url} alt={image.caption || ''} loading="lazy" />
            ))}
          </div>
        )}

        <header className="mbp-intro">
          <div className="mbp-intro-text">
            {country.region && <p className="mbr-eyebrow">{country.region}</p>}
            <h1>{country.nameFr}</h1>
            <p className="mbp-lead">{country.oneSentenceSummary || country.discoveryIntro || country.description}</p>
            <div className="mbp-actions">
              <Link to="/map" className="mbr-button">
                Voir sur la carte <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <BookmarkButton itemType="country" itemId={country._id} />
              <ShareButton url={`/country/${id}`} title={country.nameFr} />
            </div>
          </div>
          <dl className="mbp-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <TypeChips label="Rubriques de la fiche" options={TABS} counts={counts} active={tab} onChange={setTab} variant="tabs" />

        <div className="mbp-panel">
          {tab === 'reperes' && (
            <>
              {content.reperes.places.length > 0 && (
                <RubriqueSection id="mbp-places" title="Lieux à situer">
                  <ol className="mbp-list">
                    {content.reperes.places.map((place, index) => (
                      <li key={place.name}>
                        <span className="mbp-index">{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <h3>
                            {place.name} <span className="mbp-type">{PLACE_TYPES[place.type] ?? place.type}</span>
                          </h3>
                          <p>{place.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </RubriqueSection>
              )}
              {renderSections([
                { title: 'À vivre', items: content.reperes.experiences },
                { title: 'À retenir', items: content.reperes.facts },
              ])}
            </>
          )}

          {tab === 'culture' && renderSections(content.culture)}

          {tab === 'memoire' && (
            <>
              {renderSections(content.memoire)}
              {proverbs.length > 0 && (
                <RubriqueSection id="mbp-proverbs" title="Paroles">
                  <ul className="mbr-proverbs">
                    {proverbs.map((proverb) => (
                      <li key={proverb._id} className="mbr-proverb">
                        <blockquote>« {String(proverb.text).replace(/^«\s*|\s*»$/g, '')} »</blockquote>
                        <p className="mbr-meta">{joinMeta(proverb.countryName, proverb.language)}</p>
                      </li>
                    ))}
                  </ul>
                </RubriqueSection>
              )}
            </>
          )}

          {tab === 'sources' && (
            <>
              <RubriqueSection
                id="mbp-sources"
                title="Sources de cette fiche"
                subtitle="Les données sensibles se vérifient auprès des autorités avant tout déplacement."
                isEmpty={sources.length === 0 && content.notes.length === 0}
                emptyLabel="Aucune source reliée pour l’instant."
              >
                <ul className="mbp-list">
                  {sources.map((source) => (
                    <li key={source._id}>
                      <div>
                        <p className="mbr-meta">{joinMeta(source.type, source.publisher, source.year && String(source.year))}</p>
                        <h3>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}</h3>
                        {source.description && <p>{source.description}</p>}
                      </div>
                    </li>
                  ))}
                  {content.notes.map((note) => (
                    <li key={note}>
                      <p>{note}</p>
                    </li>
                  ))}
                </ul>
              </RubriqueSection>
              {content.media.length > 0 && (
                <RubriqueSection id="mbp-media" title="Documents">
                  <ul className="mbp-list">
                    {content.media.map((item) => (
                      <li key={item.url}>
                        <h3>
                          <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                        </h3>
                      </li>
                    ))}
                  </ul>
                </RubriqueSection>
              )}
            </>
          )}

          {counts[tab] === 0 && <p className="mbr-empty">Rien n’est encore relié à cet onglet.</p>}

          <aside className="mbp-contribute">
            <h2>Vous connaissez {country.nameFr} ?</h2>
            <p>Proposez un récit, un proverbe ou une source. Chaque contribution est vérifiée avant publication.</p>
            <Link to="/contribute" className="mbr-button">
              Contribuer <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
