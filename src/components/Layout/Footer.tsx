import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../stores/settingsStore'
import './Footer.css'

export const Footer = () => {
  const location = useLocation()
  const { settings, fetchSettings } = useSettingsStore()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const platformName = settings?.platformName || 'BAOBAB'

  // Ne pas afficher le footer sur certaines pages
  const hideFooter = ['/login', '/register'].includes(location.pathname)

  if (hideFooter) {
    return null
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark" aria-hidden="true" />
              <span className="footer-logo-text">{platformName}</span>
            </div>
            <p className="footer-baseline">
              Ancrés comme <em>le baobab</em>, tournés vers le monde.
            </p>
            <p className="footer-tagline">
              Plateforme culturelle panafricaine — histoire, culture, produits.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Explorer</h4>
            <ul className="footer-links">
              <li>
                <Link to="/map">Pays</Link>
              </li>
              <li>
                <Link to="/timeline">Histoire</Link>
              </li>
              <li>
                <Link to="/collections">Culture</Link>
              </li>
              <li>
                <Link to="/figures">Figures</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Boutique</h4>
            <ul className="footer-links">
              <li>
                <Link to="/shop">Tous les produits</Link>
              </li>
              <li>
                <Link to="/shop?category=artisanat">Artisanat</Link>
              </li>
              <li>
                <Link to="/shop?category=mode">Mode &amp; tissus</Link>
              </li>
              <li>
                <Link to="/cart">Mon panier</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">À propos</h4>
            <ul className="footer-links">
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/dashboard">Communauté</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/legal">Mentions légales</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} {platformName}. Tous droits réservés.</p>
          <div className="footer-langs" aria-label="Sélecteur de langue (démo)">
            <span className="footer-lang active">FR</span>
            <span className="footer-lang-sep">·</span>
            <span className="footer-lang">EN</span>
            <span className="footer-lang-sep">·</span>
            <span className="footer-lang">SW</span>
            <span className="footer-lang-sep">·</span>
            <span className="footer-lang">AR</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
