import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Compass,
  FileSearch,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Map,
  PenLine,
  Quote,
  ScrollText,
  Search,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

type DockItem = { to: string; label: string; icon: LucideIcon }
type ResourceItem = DockItem & { desc: string }

const dockItems: DockItem[] = [
  { to: '/', label: 'Accueil', icon: Compass },
  { to: '/map', label: 'Explorer', icon: Map },
  { to: '/collections', label: 'Comprendre', icon: Library },
  { to: '/stories', label: 'Mémoires', icon: ScrollText },
  { to: '/contribute', label: 'Contribuer', icon: PenLine },
]

const resourceGroups: Array<{ title: string; items: ResourceItem[] }> = [
  {
    title: 'Connaissances',
    items: [
      { to: '/timeline', label: 'Chronologies', desc: 'Les grandes dates, pays par pays', icon: Clock },
      { to: '/figures', label: 'Personnalités', desc: "Celles et ceux qui ont marqué l'histoire", icon: UserRound },
      { to: '/blog', label: 'Carnet de savoirs', desc: 'Articles, analyses et portraits', icon: BookOpen },
      { to: '/proverbs', label: 'Proverbes', desc: 'La sagesse transmise de bouche à oreille', icon: Quote },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/sources', label: 'Sources & provenance', desc: "D'où viennent nos contenus", icon: FileSearch },
    ],
  },
]

const allResourceItems = resourceGroups.flatMap((group) => group.items)
const RESOURCES_KEY = 'ressources'

interface HeaderProps {
  /** La barre du haut se pose sur le contenu (page d'accueil plein écran) */
  overlay?: boolean
}

export const Header = ({ overlay = false }: HeaderProps) => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { settings, fetchSettings } = useSettingsStore()
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const dockRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const resourcesButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const resourcesOpenRef = useRef(false)

  const platformName = settings?.platformName || 'MonBaobab'

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    resourcesOpenRef.current = isResourcesOpen
  }, [isResourcesOpen])

  useEffect(() => {
    setIsResourcesOpen(false)
    setIsSearchOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (dockRef.current && !dockRef.current.contains(target)) setIsResourcesOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (resourcesOpenRef.current) {
        setIsResourcesOpen(false)
        resourcesButtonRef.current?.focus()
      }
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

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(`${to}/`)
  const resourceIsActive = allResourceItems.some((item) => isActive(item.to))
  const activeKey = isResourcesOpen || resourceIsActive ? RESOURCES_KEY : dockItems.find((item) => isActive(item.to))?.to

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
        <>
          <div
            className="mbn-scrim"
            data-open={isResourcesOpen || undefined}
            aria-hidden="true"
            onClick={() => setIsResourcesOpen(false)}
          />

          <nav ref={dockRef} className="mbn-dock" aria-label="Navigation principale">
            <div
              id="mbn-resources-panel"
              className="mbn-panel"
              data-open={isResourcesOpen || undefined}
              inert={!isResourcesOpen}
            >
              {resourceGroups.map((group) => (
                <div className="mbn-col" key={group.title}>
                  <p className="mbn-col-title">{group.title}</p>
                  {group.items.map(({ to, label, desc, icon: Icon }) => (
                    <Link key={to} to={to} className="mbn-item" aria-current={isActive(to) ? 'page' : undefined}>
                      <Icon className="mbn-item-icon" size={20} strokeWidth={2} aria-hidden="true" />
                      <span>
                        <strong>{label}</strong>
                        <small>{desc}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              ))}

              <Link to="/map" className="mbn-feature">
                <Map size={24} strokeWidth={2} aria-hidden="true" />
                <strong>Explorer la carte</strong>
                <span>Les 55 pays du continent, leurs capitales, langues et cultures.</span>
              </Link>
            </div>

            <div className="mbn-dock-track" ref={trackRef}>
              <span
                className="mbn-dock-indicator"
                data-visible={indicator ? true : undefined}
                style={indicator ? { width: indicator.width, transform: `translateX(${indicator.x}px)` } : undefined}
                aria-hidden="true"
              />

              {dockItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  data-key={to}
                  className="mbn-dock-item"
                  aria-current={isActive(to) ? 'page' : undefined}
                  data-current={activeKey === to || undefined}
                  title={label}
                >
                  <Icon size={20} strokeWidth={2} aria-hidden="true" />
                  <span className="mbn-dock-label">{label}</span>
                </Link>
              ))}

              <span className="mbn-dock-sep" aria-hidden="true" />

              <button
                ref={resourcesButtonRef}
                type="button"
                data-key={RESOURCES_KEY}
                className="mbn-dock-item"
                data-current={activeKey === RESOURCES_KEY || undefined}
                aria-expanded={isResourcesOpen}
                aria-controls="mbn-resources-panel"
                title="Ressources"
                onClick={() => setIsResourcesOpen((open) => !open)}
              >
                <LayoutGrid size={20} strokeWidth={2} aria-hidden="true" />
                <span className="mbn-dock-label">Ressources</span>
              </button>
            </div>
          </nav>
        </>,
        document.body
      )}
    </>
  )
}
