import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Compass,
  LayoutDashboard,
  Landmark,
  LogOut,
  Map,
  PenLine,
  Search,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

type DockItem = { to: string; label: string; icon: LucideIcon; also?: string[] }

// Navigation à 5 entrées (clean.md). `also` : anciennes adresses ou pages de détail rattachées à l'entrée.
const dockItems: DockItem[] = [
  { to: '/', label: 'Accueil', icon: Compass },
  { to: '/map', label: 'Explorer', icon: Map, also: ['/country'] },
  { to: '/recits', label: 'Récits', icon: BookOpen, also: ['/blog', '/stories', '/collections'] },
  { to: '/reperes', label: 'Repères', icon: Landmark, also: ['/timeline', '/figures', '/proverbs'] },
  { to: '/contribute', label: 'Contribuer', icon: PenLine, also: ['/sources'] },
]

interface HeaderProps {
  /** La barre du haut se pose sur le contenu (page d'accueil plein écran) */
  overlay?: boolean
}

export const Header = ({ overlay = false }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { settings, fetchSettings } = useSettingsStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const platformName = settings?.platformName || 'MonBaobab'

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    setIsSearchOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsUserMenuOpen(false)
      setIsSearchOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const matches = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`)
  const isActive = (item: DockItem) => matches(item.to) || (item.also ?? []).some(matches)
  const activeKey = dockItems.find(isActive)?.to

  // L'indicateur crème glisse sous l'élément actif ; il suit aussi les changements de taille
  // (sur mobile, l'élément actif s'élargit pour afficher son libellé)
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const target = activeKey ? track.querySelector<HTMLElement>(`[data-key="${activeKey}"]`) : null
      setIndicator(target ? { x: target.offsetLeft, width: target.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    track.querySelectorAll('[data-key]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [activeKey])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="mbn" data-overlay={overlay || undefined}>
        <div className="mbn-bar">
          <Link to="/" className="mbn-logo" aria-label={`${platformName}, accueil`}>
            <img src="/Logo/Fichier%203.svg" alt="" width="132" height="44" />
          </Link>

          <div className="mbn-actions">
            <button
              type="button"
              className="mbn-icon-btn"
              aria-label="Rechercher"
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              <Search size={20} strokeWidth={2} aria-hidden="true" />
            </button>

            {isAuthenticated ? (
              <div className="mbn-user" ref={userMenuRef}>
                <button
                  type="button"
                  className="mbn-avatar"
                  aria-label="Mon compte"
                  aria-expanded={isUserMenuOpen}
                  aria-controls="mbn-user-menu"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </button>
                <div id="mbn-user-menu" className="mbn-menu" data-open={isUserMenuOpen || undefined} inert={!isUserMenuOpen}>
                  <p className="mbn-menu-head">
                    <strong>{user?.name || 'Utilisateur'}</strong>
                    <span>{user?.email}</span>
                  </p>
                  <Link to="/dashboard"><LayoutDashboard size={18} aria-hidden="true" /> Mon espace</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin"><Settings size={18} aria-hidden="true" /> Administration</Link>
                  )}
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={18} aria-hidden="true" /> Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mbn-auth">
                  <Link to="/login" className="mbn-signin">Se connecter</Link>
                  <Link to="/register" className="mbn-join">Rejoindre</Link>
                </div>
                <Link to="/login" className="mbn-icon-btn mbn-auth-compact" aria-label="Se connecter">
                  <UserRound size={20} strokeWidth={2} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>

        {isSearchOpen && (
          <div className="mbn-search">
            <AdvancedSearch />
          </div>
        )}
      </header>

      {/* Boussole en portail vers <body> : l'enveloppe des transitions de page
          (.page-transition-shell) porte un transform, qui ferait se positionner un élément
          fixe par rapport à elle et non à l'écran */}
      {createPortal(
        <nav className="mbn-dock" aria-label="Navigation principale">
          <div className="mbn-dock-track" ref={trackRef}>
            <span
              className="mbn-dock-indicator"
              data-visible={indicator ? true : undefined}
              style={indicator ? { width: indicator.width, transform: `translateX(${indicator.x}px)` } : undefined}
              aria-hidden="true"
            />

            {dockItems.map((item) => {
              const { to, label, icon: Icon } = item
              return (
                <Link
                  key={to}
                  to={to}
                  data-key={to}
                  className="mbn-dock-item"
                  aria-current={isActive(item) ? 'page' : undefined}
                  data-current={activeKey === to || undefined}
                  title={label}
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  <span className="mbn-dock-label">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>,
        document.body
      )}
    </>
  )
}
