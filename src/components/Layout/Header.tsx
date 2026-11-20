import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, Search, Settings, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

// Navigation de la maquette Figma : composant « Navigation/Claire », sa variante posée sur la hero,
// et le cadre « Mobile 390 / Menu ouvert ».
type NavItem = { to: string; label: string; also?: string[] }

// Les 5 entrées de clean.md. `also` : anciennes adresses ou pages de détail rattachées à l'entrée.
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Accueil' },
  { to: '/map', label: 'Explorer', also: ['/country'] },
  { to: '/recits', label: 'Récits', also: ['/blog', '/stories', '/collections'] },
  { to: '/reperes', label: 'Repères', also: ['/timeline', '/figures', '/proverbs'] },
  { to: '/contribute', label: 'Contribuer', also: ['/sources'] },
]

interface HeaderProps {
  /** La barre se pose sur la hero verte de l'accueil : logo blanc, pastilles en verre */
  overlay?: boolean
}

export const Header = ({ overlay = false }: HeaderProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const { settings, fetchSettings } = useSettingsStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const platformName = settings?.platformName || 'MonBaobab'

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setIsSearchOpen(false)
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsSearchOpen(false)
      setIsMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const matches = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`)
  const isActive = (item: NavItem) => matches(item.to) || (item.also ?? []).some(matches)

  // Bouton de droite : « Mon espace » une fois connecté, sinon « Rejoindre » (ou « Explorer l'atlas » sur la hero)
  const cta = isAuthenticated
    ? { to: '/dashboard', label: 'Mon espace' }
    : overlay
      ? { to: '/map', label: 'Explorer l’atlas' }
      : { to: '/register', label: 'Rejoindre' }

  const links = (className: string) =>
    NAV_ITEMS.map((item) => (
      <Link key={item.to} to={item.to} className={className} aria-current={isActive(item) ? 'page' : undefined}>
        {item.label}
        {className === 'mbn-menu-link' && <ArrowRight size={20} aria-hidden="true" />}
      </Link>
    ))

  return (
    <header className="mbn" data-overlay={overlay || undefined} data-menu-open={isMenuOpen || undefined}>
      <div className="mbn-bar">
        <Link to="/" className="mbn-logo" aria-label={`${platformName}, accueil`}>
          <img src={overlay || isMenuOpen ? '/Logo/Fichier%207.svg' : '/Logo/Fichier%203.svg'} alt="" width="144" height="48" />
        </Link>

        <nav className="mbn-links" aria-label="Navigation principale">
          {links('mbn-link')}
        </nav>

        <div className="mbn-actions">
          <button
            type="button"
            className="mbn-round"
            aria-label="Rechercher"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            <Search size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className="mbn-round mbn-desktop" aria-label="Administration">
              <Settings size={20} strokeWidth={1.8} aria-hidden="true" />
            </Link>
          )}
          <Link to={cta.to} className="mbn-cta mbn-desktop">
            {cta.label} {!overlay && <ArrowRight size={18} aria-hidden="true" />}
          </Link>
          <button
            type="button"
            className="mbn-round mbn-mobile"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mbn-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div id="mbn-menu" className="mbn-menu">
          <nav aria-label="Menu">{links('mbn-menu-link')}</nav>
          <Link to={isAuthenticated ? '/dashboard' : '/map'} className="mbn-menu-cta">
            {isAuthenticated ? 'Mon espace' : 'Explorer l’atlas'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="mbn-menu-signin">
              Se connecter
            </Link>
          )}
        </div>
      )}

      {isSearchOpen && (
        <div className="mbn-search">
          <AdvancedSearch />
        </div>
      )}
    </header>
  )
}
