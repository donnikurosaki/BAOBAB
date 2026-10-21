import { lazy, Suspense, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, Clock, Library, Quote, ScrollText, UserRound } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { allAfricanCountries, type AfricanCountry } from '../data/allAfricanCountries'
import { homeService } from '../services/api'
import { useSettingsStore } from '../stores/settingsStore'
import './Home.css'

// Les tracés de la carte pèsent ~200 Ko : chargés après le texte du haut de page
const HeroMap = lazy(() => import('../components/AfricaMap/HeroMap').then((m) => ({ default: m.HeroMap })))

interface HomeStats {
  figures?: number
  sources?: number
  products?: number
}

interface NewsItem {
  id: string
  title: string
  excerpt: string
  category: string
  image: string
  source: string
  date: string
  url: string
}

interface FeaturedBlog {
  _id: string
  title: string
  excerpt?: string
  category?: string
  image?: string
}

const featuredCountryIds = ['SN', 'GH', 'CI', 'NG', 'BF', 'ML']

const doors = [
  { to: '/stories', title: 'Mémoires', desc: 'Récits et témoignages transmis entre générations.', icon: ScrollText },
  { to: '/timeline', title: 'Chronologies', desc: 'Les grandes dates du continent, pays par pays.', icon: Clock },
  { to: '/figures', title: 'Personnalités', desc: "Celles et ceux qui ont marqué l'histoire.", icon: UserRound },
  { to: '/proverbs', title: 'Proverbes', desc: 'La sagesse transmise de bouche à oreille.', icon: Quote },
  { to: '/collections', title: 'Collections', desc: 'Des ensembles thématiques pour approfondir.', icon: Library },
  { to: '/blog', title: 'Carnet de savoirs', desc: 'Articles, analyses et portraits.', icon: BookOpen },
]

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

const matchesCountry = (country: AfricanCountry, query: string) =>
  country.nameFr.toLowerCase().includes(query) ||
  country.capital.toLowerCase().includes(query) ||
  country.id.toLowerCase() === query

export const Home = () => {
  const { settings } = useSettingsStore()
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [blogs, setBlogs] = useState<FeaturedBlog[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    homeService.getStats().then((res) => setStats(res.data)).catch(() => {})
    homeService
      .getFeatured({ limit: 3 })
      .then((res) => setBlogs(Array.isArray(res.data?.blogs) ? res.data.blogs.slice(0, 3) : []))
      .catch(() => {})
    fetch('/api/news/africa')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.items
        if (Array.isArray(items)) setNews(items.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  const featuredCountries = useMemo(
    () => featuredCountryIds.map((id) => allAfricanCountries.find((c) => c.id === id)).filter(Boolean) as AfricanCountry[],
    []
  )

  const trimmedQuery = query.trim().toLowerCase()
  const results = useMemo(
    () =>
      trimmedQuery
        ? allAfricanCountries
            .filter((country) => matchesCountry(country, trimmedQuery))
            .sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))
            .slice(0, 8)
        : [],
    [trimmedQuery]
  )

  // Chiffres réels uniquement : un chiffre absent de l'API n'est pas affiché
  const metrics = [
    { label: 'pays', value: allAfricanCountries.length },
    { label: 'personnalités', value: stats?.figures },
    { label: 'sources', value: stats?.sources },
    { label: 'objets de créateurs', value: stats?.products },
  ].filter((m): m is { label: string; value: number } => typeof m.value === 'number' && m.value > 0)

  const team = settings?.team ?? []

  return (
    <Layout fullWidth>
      <div className="mbh">
        <section className="mbh-hero" aria-labelledby="mbh-title">
          <div className="mbh-hero-text">
            <h1 id="mbh-title">Découvrez l’Afrique autrement.</h1>
            <p className="mbh-lead">
              Un atlas culturel pour explorer les {allAfricanCountries.length} pays du continent : leurs récits, leur
              patrimoine, leurs territoires et leurs savoir-faire.
            </p>
            <Link to="/map" className="mbh-cta">
              Explorer la carte
              <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </Link>

            <div className="mbh-finder">
              <label htmlFor={searchId}>Ou allez droit à un pays</label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sénégal, Nairobi…"
                autoComplete="off"
              />
              {trimmedQuery ? (
                <ul className="mbh-results" aria-live="polite">
                  {results.length > 0 ? (
                    results.map((country) => (
                      <li key={country.id}>
                        <Link to={`/country/${country.id.toLowerCase()}`}>
                          <strong>{country.nameFr}</strong>
                          <span>{country.capital}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="mbh-results-empty">Aucun pays ne correspond à « {query.trim()} ».</li>
                  )}
                </ul>
              ) : (
                <ul className="mbh-chips" aria-label="Pays suggérés">
                  {featuredCountries.map((country) => (
                    <li key={country.id}>
                      <Link to={`/country/${country.id.toLowerCase()}`}>{country.nameFr}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <figure className="mbh-map">
            <Suspense fallback={<div className="mbh-map-placeholder" />}>
              <HeroMap highlighted={featuredCountryIds} />
            </Suspense>
            <figcaption>Choisissez un pays sur la carte pour ouvrir sa fiche.</figcaption>
          </figure>
        </section>

        {metrics.length >= 2 && (
          <section className="mbh-metrics" aria-label="MonBaobab en chiffres">
            <dl>
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{formatNumber(metric.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mbh-section" aria-labelledby="mbh-doors">
          <header className="mbh-head">
            <h2 id="mbh-doors">Six portes d’entrée vers une Afrique plurielle</h2>
            <p>Des racines profondes, des voix contemporaines et des horizons ouverts, à explorer à votre rythme.</p>
          </header>
          <ul className="mbh-doors">
            {doors.map(({ to, title, desc, icon: Icon }) => (
              <li key={to}>
                <Link to={to} className="mbh-card mbh-door">
                  <Icon className="mbh-door-icon" size={24} strokeWidth={2} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <ArrowRight className="mbh-door-arrow" size={20} strokeWidth={2} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {news.length > 0 && (
          <section className="mbh-section" aria-labelledby="mbh-news">
            <header className="mbh-head">
              <h2 id="mbh-news">L’Afrique qui se construit aujourd’hui</h2>
            </header>
            <ul className="mbh-reads">
              {news.map((item) => {
                const external = /^https?:\/\//.test(item.url)
                const body = (
                  <>
                    {item.image && <img src={item.image} alt="" loading="lazy" />}
                    <div className="mbh-read-body">
                      <p className="mbh-read-meta">
                        {item.category} · {item.source}
                      </p>
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      {external && (
                        <span className="mbh-read-out">
                          Lire sur {item.source} <ArrowUpRight size={16} aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </>
                )
                return (
                  <li key={item.id}>
                    {external ? (
                      <a href={item.url} className="mbh-card mbh-read" target="_blank" rel="noopener noreferrer">
                        {body}
                      </a>
                    ) : (
                      <Link to={item.url} className="mbh-card mbh-read">
                        {body}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {blogs.length > 0 && (
          <section className="mbh-section" aria-labelledby="mbh-blog">
            <header className="mbh-head">
              <h2 id="mbh-blog">Sélection éditoriale</h2>
              <Link to="/blog" className="mbh-more">
                Tout le carnet de savoirs <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </header>
            <ul className="mbh-reads">
              {blogs.map((blog) => (
                <li key={blog._id}>
                  <Link to={`/blog/${blog._id}`} className="mbh-card mbh-read">
                    {blog.image && <img src={blog.image} alt="" loading="lazy" />}
                    <div className="mbh-read-body">
                      <p className="mbh-read-meta">{blog.category || 'Article'}</p>
                      <h3>{blog.title}</h3>
                      {blog.excerpt && <p>{blog.excerpt}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {team.length > 0 && (
          <section className="mbh-section mbh-team" aria-labelledby="mbh-team">
            <header className="mbh-head">
              <h2 id="mbh-team">Les personnes derrière MonBaobab</h2>
              <p>Une plateforme construite avec celles et ceux qui font vivre l’Afrique.</p>
            </header>
            <ul>
              {team.map((member) => (
                <li key={member.name}>
                  <img src={member.image} alt="" loading="lazy" style={{ objectPosition: member.focus }} />
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <p className="mbh-team-origin">{member.nationality}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mbh-close" aria-labelledby="mbh-close">
          <h2 id="mbh-close">Ce qui est transmis ne disparaît pas.</h2>
          <p>
            Les langues, les recettes, les récits et les savoir-faire forment une mémoire vivante. Ajoutez-y votre
            pierre.
          </p>
          <Link to="/contribute" className="mbh-cta mbh-cta-light">
            Contribuer
            <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </Layout>
  )
}
