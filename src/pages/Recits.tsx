import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { blogService, collectionService, storyService } from '../services/api'
import './Rubriques.css'

// Récits rassemble trois anciennes rubriques (clean.md) :
// les articles (/blog), les histoires (/stories) et les dossiers (/collections).
type RecitType = 'articles' | 'histoires' | 'dossiers'

interface Recit {
  id: string
  type: RecitType
  title: string
  excerpt: string
  image?: string
  meta: string
  to: string
}

const TYPES: Array<{ key: RecitType | 'tous'; label: string }> = [
  { key: 'tous', label: 'Tous' },
  { key: 'articles', label: 'Articles' },
  { key: 'histoires', label: 'Histoires' },
  { key: 'dossiers', label: 'Dossiers' },
]

// Les services renvoient tantôt un tableau, tantôt { data }, { stories }…
const toList = (data: unknown, key: string): any[] => {
  if (Array.isArray(data)) return data
  const record = data as Record<string, unknown> | null
  const list = record?.[key] ?? record?.data ?? record?.blogs ?? record?.posts
  return Array.isArray(list) ? list : []
}

const joinMeta = (...parts: Array<string | undefined | false>) => parts.filter(Boolean).join(' · ')

const minutes = (value?: number) => (value ? `${value} min` : undefined)

const normalize = (blogs: any[], stories: any[], collections: any[]): Recit[] => [
  ...blogs.map((post) => ({
    id: post._id,
    type: 'articles' as const,
    title: post.title,
    excerpt: post.excerpt || '',
    image: post.image || undefined,
    meta: joinMeta(post.category || 'Article', minutes(post.readTime)),
    to: `/blog/${post._id}`,
  })),
  ...stories.map((story) => ({
    id: story._id,
    type: 'histoires' as const,
    title: story.title,
    excerpt: story.description || story.subtitle || '',
    image: story.coverImage || undefined,
    meta: joinMeta(story.category || 'Histoire', minutes(story.readingTime)),
    to: `/stories/${story._id}`,
  })),
  ...collections.map((collection) => ({
    id: collection._id,
    type: 'dossiers' as const,
    title: collection.title,
    excerpt: collection.shortDescription || collection.description || '',
    image: collection.coverImage || undefined,
    meta: joinMeta('Dossier', collection.items?.length ? `${collection.items.length} éléments` : undefined),
    to: `/collections/${collection._id}`,
  })),
]

export const Recits = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [recits, setRecits] = useState<Recit[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const active = (searchParams.get('type') as RecitType | null) ?? 'tous'

  useEffect(() => {
    let cancelled = false
    // Une rubrique en panne ne doit pas vider les deux autres
    Promise.allSettled([blogService.getAll(), storyService.getAll(), collectionService.getAll()]).then(
      ([blogs, stories, collections]) => {
        if (cancelled) return
        const value = (result: PromiseSettledResult<any>, key: string) =>
          result.status === 'fulfilled' ? toList(result.value.data, key) : []
        setRecits(normalize(value(blogs, 'blogs'), value(stories, 'stories'), value(collections, 'collections')))
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const counts = useMemo(() => {
    const byType = { tous: recits.length, articles: 0, histoires: 0, dossiers: 0 }
    recits.forEach((recit) => (byType[recit.type] += 1))
    return byType
  }, [recits])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return recits.filter(
      (recit) =>
        (active === 'tous' || recit.type === active) &&
        (!needle || `${recit.title} ${recit.excerpt}`.toLowerCase().includes(needle))
    )
  }, [recits, active, query])

  const stories = visible.filter((recit) => recit.type !== 'dossiers')
  const dossiers = visible.filter((recit) => recit.type === 'dossiers')
  const [feature, ...rest] = stories

  const setType = (key: RecitType | 'tous') => {
    const next = new URLSearchParams(searchParams)
    if (key === 'tous') next.delete('type')
    else next.set('type', key)
    setSearchParams(next, { replace: true })
  }

  return (
    <Layout>
      <div className="mbr">
        <header className="mbr-intro">
          <div>
            <p className="mbr-eyebrow">Récits</p>
            <h1>Des histoires qui créent des liens</h1>
          </div>
          <p>Articles, histoires et dossiers pour comprendre les lieux, les voix et les héritages du continent.</p>
        </header>

        <div className="mbr-filters">
          <div className="mbr-chips" role="group" aria-label="Type de récit">
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
          <label className="mbr-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un récit"
              aria-label="Rechercher un récit"
            />
          </label>
        </div>

        {loading ? (
          <p className="mbr-empty">Chargement des récits…</p>
        ) : visible.length === 0 ? (
          <p className="mbr-empty">Aucun récit ne correspond pour l’instant.</p>
        ) : (
          <>
            {feature && (
              <Link to={feature.to} className={`mbr-feature${feature.image ? '' : ' mbr-feature--plain'}`}>
                {feature.image && (
                  <div className="mbr-feature-media" style={{ backgroundImage: `url(${feature.image})` }} aria-hidden="true" />
                )}
                <div className="mbr-feature-body">
                  <p className="mbr-meta">À la une · {feature.meta}</p>
                  <h2>{feature.title}</h2>
                  {feature.excerpt && <p>{feature.excerpt}</p>}
                  <span className="mbr-button">
                    Lire le récit <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <ul className="mbr-grid">
                {rest.map((recit) => (
                  <li key={recit.id}>
                    <Link to={recit.to} className={`mbr-card${recit.image ? '' : ' mbr-card--plain'}`}>
                      {recit.image && (
                        <div className="mbr-card-media" style={{ backgroundImage: `url(${recit.image})` }} aria-hidden="true" />
                      )}
                      <div className="mbr-card-body">
                        <p className="mbr-meta">{recit.meta}</p>
                        <h3>{recit.title}</h3>
                        {recit.excerpt && <p>{recit.excerpt}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {dossiers.length > 0 && (
              <section className="mbr-section" aria-labelledby="mbr-dossiers">
                <div className="mbr-section-head">
                  <div>
                    <h2 id="mbr-dossiers">Dossiers</h2>
                    <p>Des récits rassemblés autour d’un même sujet.</p>
                  </div>
                </div>
                <ul className="mbr-dossiers">
                  {dossiers.map((dossier) => (
                    <li key={dossier.id}>
                      <Link to={dossier.to} className="mbr-dossier">
                        <p className="mbr-meta">{dossier.meta}</p>
                        <h3>{dossier.title}</h3>
                        {dossier.excerpt && <p>{dossier.excerpt}</p>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
