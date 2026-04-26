import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import './AfricaStats.css'

interface HomeStats {
  countries: number
  blogPosts: number
  products: number
  events: number
  figures: number
  stories?: number
  collections?: number
  users?: number
  totalViews?: number
}

interface AfricaStatsProps {
  stats: HomeStats | null
  loading?: boolean
}

/* ── Africa silhouette SVG (coordinates derived from lat/lon geographic data) ── */
const AfricaSilhouette = () => (
  <svg
    viewBox="0 0 230 280"
    className="africa-silhouette"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="
      M 40 7
      C 68 1 82 1 95 2
      C 105 12 107 16 108 17
      C 130 20 155 22 172 25
      L 165 29
      C 175 50 190 76 201 98
      L 225 96
      C 227 99 228 101 228 103
      C 220 118 208 132 200 148
      C 196 155 192 158 191 162
      C 191 175 191 182 191 188
      C 183 200 178 206 175 212
      C 171 224 169 233 168 242
      C 150 263 136 274 125 279
      C 121 279 117 278 112 277
      C 103 267 99 260 97 255
      C 97 236 97 223 98 212
      C 98 190 98 179 98 168
      C 93 159 89 153 88 148
      C 78 138 73 133 68 129
      C 60 126 56 125 52 125
      C 45 125 42 125 38 125
      C 31 126 26 127 22 127
      C 19 121 16 118 15 114
      C 11 110 9 108 8 106
      C 4 99 1 94 0 88
      C 1 77 2 71 2 64
      C 7 50 11 43 15 37
      C 15 29 15 25 15 21
      C 23 14 31 10 40 7 Z
    " />
  </svg>
)

/* ── Animated donut ring ── */
interface DonutProps {
  percentage: number
  color: string
  animated: boolean
}

const RADIUS = 38
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const DonutRing = ({ percentage, color, animated }: DonutProps) => {
  const dashOffset = animated
    ? CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE

  return (
    <svg viewBox="0 0 100 100" className="donut-svg">
      {/* Track */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        className="donut-track"
      />
      {/* Fill */}
      <circle
        cx="50" cy="50" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        style={{
          transition: animated ? 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
    </svg>
  )
}

/* ── Thin separator ── */
const Separator = () => <div className="info-sep" aria-hidden="true" />

/* ══════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════ */
export const AfricaStats = ({ stats, loading = false }: AfricaStatsProps) => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (inView) setAnimated(true)
  }, [inView])

  /* ── Display data: API stats OR African continent facts ── */
  const d = stats
    ? {
        hero:  { n: stats.countries,       dec: 0, sfx: '',   tag: 'PAYS',      label: 'Pays documentés',        sub: 'Cultures & patrimoine' },
        ring1: { n: stats.totalViews ?? 0,  dec: 0, sfx: '',   pct: 72, color: '#c4622d', label: 'Vues totales' },
        ring2: { n: stats.blogPosts,        dec: 0, sfx: '',   pct: 58, color: '#d4af37', label: 'Articles publiés' },
        sm1:   { n: stats.events,           dec: 0, sfx: '',   tag: 'HISTOIRE', label: 'Événements hist.' },
        sm2:   { n: stats.figures,          dec: 0, sfx: '',   tag: 'CULTURE',  label: 'Figures historiques' },
        sm3:   { n: stats.products,         dec: 0, sfx: '',   tag: 'BOUTIQUE', label: 'Produits disponibles' },
      }
    : {
        hero:  { n: 54,    dec: 0, sfx: '',   tag: 'PAYS',      label: 'États souverains',       sub: 'Un continent, 54 nations' },
        ring1: { n: 1.4,   dec: 1, sfx: 'Md', pct: 70, color: '#c4622d', label: 'Habitants' },
        ring2: { n: 30.3,  dec: 1, sfx: 'M',  pct: 60, color: '#d4af37', label: 'Millions de km²' },
        sm1:   { n: 2000,  dec: 0, sfx: '+',  tag: 'DIVERSITÉ',  label: 'Langues parlées' },
        sm2:   { n: 3000,  dec: 0, sfx: '+',  tag: 'PEUPLES',   label: 'Groupes ethniques' },
        sm3:   { n: 55,    dec: 0, sfx: '',   tag: 'POLITIQUE', label: 'États membres UA' },
      }

  if (loading) {
    return (
      <section className="infographic-section">
        <div className="infographic-header">
          <span className="info-overtitle">STATISTIQUES</span>
          <h2 className="infographic-title">L'Afrique en Chiffres</h2>
          <div className="infographic-titleline" />
        </div>
        <div className="info-bento info-bento--loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="info-skeleton" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="infographic-section" ref={ref}>
      {/* ── Header ── */}
      <div className="infographic-header">
        <span className="info-overtitle">STATISTIQUES</span>
        <h2 className="infographic-title">L'Afrique en Chiffres</h2>
        <div className="infographic-titleline" />
      </div>

      {/* ── Bento grid ── */}
      <div className="info-bento">

        {/* ─── HERO card ─── */}
        <div className="info-card info-card--hero">
          <AfricaSilhouette />
          <div className="hero-body">
            <span className="info-tag info-tag--terracotta">{d.hero.tag}</span>
            <div className="hero-number">
              {inView
                ? <CountUp end={d.hero.n} decimals={d.hero.dec} duration={2.5} separator=" " />
                : '0'}
              {d.hero.sfx && <span className="hero-sfx">{d.hero.sfx}</span>}
            </div>
            <Separator />
            <p className="hero-label">{d.hero.label}</p>
            <p className="hero-sub">{d.hero.sub}</p>
          </div>
          <div className="hero-accent-line" />
        </div>

        {/* ─── Ring 1 (Terracotta) ─── */}
        <div className="info-card info-card--ring">
          <span className="info-tag info-tag--muted">
            {stats ? 'AUDIENCE' : 'POPULATION'}
          </span>
          <div className="ring-wrapper">
            <DonutRing percentage={d.ring1.pct} color={d.ring1.color} animated={animated} />
            <div className="ring-center">
              <span className="ring-val">
                {inView
                  ? <CountUp end={d.ring1.n} decimals={d.ring1.dec} duration={2} separator=" " />
                  : '0'}
              </span>
              {d.ring1.sfx && <span className="ring-unit">{d.ring1.sfx}</span>}
            </div>
          </div>
          <p className="info-card-label">{d.ring1.label}</p>
        </div>

        {/* ─── Ring 2 (Gold) ─── */}
        <div className="info-card info-card--ring">
          <span className="info-tag info-tag--muted">
            {stats ? 'CONTENU' : 'TERRITOIRE'}
          </span>
          <div className="ring-wrapper">
            <DonutRing percentage={d.ring2.pct} color={d.ring2.color} animated={animated} />
            <div className="ring-center">
              <span className="ring-val">
                {inView
                  ? <CountUp end={d.ring2.n} decimals={d.ring2.dec} duration={2} separator=" " />
                  : '0'}
              </span>
              {d.ring2.sfx && <span className="ring-unit">{d.ring2.sfx}</span>}
            </div>
          </div>
          <p className="info-card-label">{d.ring2.label}</p>
        </div>

        {/* ─── Small stat 1 ─── */}
        <div className="info-card info-card--compact">
          <span className="info-tag info-tag--muted">{d.sm1.tag}</span>
          <div className="compact-number">
            {inView
              ? <CountUp end={d.sm1.n} decimals={d.sm1.dec} duration={2} separator=" " />
              : '0'}
            {d.sm1.sfx && <span className="compact-sfx">{d.sm1.sfx}</span>}
          </div>
          <p className="compact-label">{d.sm1.label}</p>
        </div>

        {/* ─── Small stat 2 ─── */}
        <div className="info-card info-card--compact">
          <span className="info-tag info-tag--muted">{d.sm2.tag}</span>
          <div className="compact-number">
            {inView
              ? <CountUp end={d.sm2.n} decimals={d.sm2.dec} duration={2} separator=" " />
              : '0'}
            {d.sm2.sfx && <span className="compact-sfx">{d.sm2.sfx}</span>}
          </div>
          <p className="compact-label">{d.sm2.label}</p>
        </div>

        {/* ─── Small stat 3 ─── */}
        <div className="info-card info-card--compact">
          <span className="info-tag info-tag--muted">{d.sm3.tag}</span>
          <div className="compact-number">
            {inView
              ? <CountUp end={d.sm3.n} decimals={d.sm3.dec} duration={2} separator=" " />
              : '0'}
            {d.sm3.sfx && <span className="compact-sfx">{d.sm3.sfx}</span>}
          </div>
          <p className="compact-label">{d.sm3.label}</p>
        </div>
      </div>
    </section>
  )
}
