import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { BaobabGlyph } from './glyphs'
import './HeroSplit.css'

export const HeroSplit = () => {
  return (
    <section className="hero-split">
      <div className="hero-split-inner">
        <div className="hero-split-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            Plateforme culturelle panafricaine
          </div>
          <h1 className="hero-split-title">
            Découvrez la <span className="hero-title-accent">richesse</span> d'un continent en 54 histoires.
          </h1>
          <p className="hero-split-lead">
            BAOBAB rassemble la culture, l'histoire et les produits authentiques d'Afrique.
            Explorez un pays, lisez son récit, commandez ses trésors.
          </p>
          <div className="hero-split-actions">
            <a href="#map" className="hero-btn hero-btn-primary">
              Explorer la carte
              <ArrowRight size={16} />
            </a>
            <Link to="/shop" className="hero-btn">
              <ShoppingBag size={16} />
              Voir la boutique
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-placeholder">
            <BaobabGlyph className="hero-baobab-glyph" size={140} />
            <span>Visuel baobab · emblème</span>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-n">54</div>
              <div className="hero-stat-l">Pays</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">2000+</div>
              <div className="hero-stat-l">Langues</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">1,4Md</div>
              <div className="hero-stat-l">Habitants</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
