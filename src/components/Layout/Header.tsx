import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  ChevronDown,
  Clock,
  FileSearch,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Quote,
  Search,
  Settings,
  ShoppingBag,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { AdvancedSearch } from '../Search/AdvancedSearch'
import './Header.css'

type NavItem = { to: string; label: string }
type ResourceItem = NavItem & { desc: string; icon: LucideIcon }

const primaryItems: NavItem[] = [
  { to: '/map', label: 'Explorer' },
  { to: '/collections', label: 'Comprendre' },
  { to: '/stories', label: 'Mémoires' },
  { to: '/contribute', label: 'Contribuer' },
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
      { to: '/communities', label: 'Cercles de mémoire', desc: "Des groupes d'échange par thème", icon: UsersRound },
      { to: '/quizzes', label: 'Apprendre', desc: 'Tester ses connaissances en jouant', icon: HelpCircle },
      { to: '/shop', label: 'Créateurs & objets', desc: "L'artisanat de créateurs du continent", icon: ShoppingBag },
    ],
  },
]

const allResourceItems = resourceGroups.flatMap((group) => group.items)

// Délai avant fermeture au survol : laisse le pointeur traverser l'espace entre le bouton et le panneau
const HOVER_CLOSE_DELAY = 140

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.getItemCount())
  const { settings, fetchSettings } = useSettingsStore()
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const resourcesRef = useRef<HTMLDivElement>(null)
  const resourcesButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const drawerToggleRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const platformName = settings?.platformName || 'MonBaobab'

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsResourcesOpen(false)
    setIsDrawerOpen(false)
    setIsSearchOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (resourcesRef.current && !resourcesRef.current.contains(target)) setIsResourcesOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (isResourcesOpen) {
        setIsResourcesOpen(false)
        resourcesButtonRef.current?.focus()
      }
      if (isDrawerOpen) setIsDrawerOpen(false)
      setIsUserMenuOpen(false)
      setIsSearchOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isResourcesOpen, isDrawerOpen])

  // Tiroir mobile : bloque le défilement de la page, place le focus dedans, le rend au bouton à la fermeture
  useEffect(() => {
    if (!isDrawerOpen) return
    const toggle = drawerToggleRef.current
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    return () => {
      document.body.style.overflow = ''
      toggle?.focus()
    }
  }, [isDrawerOpen])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`)
  const resourceIsActive = allResourceItems.some((item) => isActive(item.to))

  const openResourcesOnHover = () => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    window.clearTimeout(closeTimer.current)
    setIsResourcesOpen(true)
  }

  const closeResourcesOnLeave = () => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    closeTimer.current = window.setTimeout(() => setIsResourcesOpen(false), HOVER_CLOSE_DELAY)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="mbn" data-scrolled={isScrolled || undefined}>
        <div className="mbn-bar">
          <Link to="/" className="mbn-logo" aria-label={`${platformName}, accueil`}>
            <img src="/Logo/Fichier%203.svg" alt="" width="132" height="44" />
          </Link>

          <nav className="mbn-primary" aria-label="Navigation principale">
            {primaryItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="mbn-link"
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

            <div
              className="mbn-resources"
              ref={resourcesRef}
              onPointerEnter={openResourcesOnHover}
              onPointerLeave={closeResourcesOnLeave}
            >
              <button
                ref={resourcesButtonRef}
                type="button"
                className="mbn-link mbn-trigger"
                data-active={resourceIsActive || undefined}
                aria-expanded={isResourcesOpen}
                aria-controls="mbn-resources-panel"
                onClick={() => setIsResourcesOpen((open) => !open)}
              >
                Ressources
                <ChevronDown className="mbn-caret" size={16} strokeWidth={2} aria-hidden="true" />
              </button>

              <div id="mbn-resources-panel" className="mbn-panel" data-open={isResourcesOpen || undefined} inert={!isResourcesOpen}>
                <div className="mbn-panel-inner">
                  {resourceGroups.map((group) => (
                    <div className="mbn-col" key={group.title}>
                      <p className="mbn-col-title">{group.title}</p>
                      {group.items.map(({ to, label, desc, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          className="mbn-item"
                          aria-current={isActive(to) ? 'page' : undefined}
                        >
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
              </div>
            </div>
          </nav>

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

            <Link
              to="/cart"
              className="mbn-icon-btn"
              aria-label={itemCount ? `Panier, ${itemCount} article${itemCount > 1 ? 's' : ''}` : 'Panier'}
            >
              <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
              {itemCount > 0 && <span className="mbn-badge" aria-hidden="true">{itemCount}</span>}
            </Link>

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
                  <Link to="/communities"><UsersRound size={18} aria-hidden="true" /> Mes cercles</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin"><Settings size={18} aria-hidden="true" /> Administration</Link>
                  )}
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={18} aria-hidden="true" /> Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="mbn-auth">
                <Link to="/login" className="mbn-signin">Se connecter</Link>
                <Link to="/register" className="mbn-join">Rejoindre</Link>
              </div>
            )}

            <button
              ref={drawerToggleRef}
              type="button"
              className="mbn-icon-btn mbn-burger"
              aria-label="Ouvrir le menu"
              aria-expanded={isDrawerOpen}
              aria-controls="mbn-drawer"
              onClick={() => setIsDrawerOpen(true)}
            >
              <Menu size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mbn-search">
            <AdvancedSearch />
          </div>
        )}
      </header>

      {/* Voile du méga-menu : reste à côté de la navbar pour passer sous elle */}
      <div
        className="mbn-scrim"
        data-open={isResourcesOpen || undefined}
        aria-hidden="true"
        onClick={() => setIsResourcesOpen(false)}
      />

      {/* Tiroir mobile, en portail vers <body> : l'enveloppe des transitions de page
          (.page-transition-shell) porte un transform, qui ferait se positionner un élément fixe
          par rapport à elle et non à l'écran */}
      {createPortal(
        <>
          <div
            className="mbn-scrim mbn-scrim-drawer"
            data-open={isDrawerOpen || undefined}
            aria-hidden="true"
            onClick={() => setIsDrawerOpen(false)}
          />

          <nav
            id="mbn-drawer"
            ref={drawerRef}
            className="mbn-drawer"
            data-open={isDrawerOpen || undefined}
            aria-label="Menu"
            inert={!isDrawerOpen}
          >
            <div className="mbn-drawer-head">
              <img src="/Logo/Fichier%203.svg" alt={platformName} width="120" height="40" />
              <button type="button" className="mbn-icon-btn" aria-label="Fermer le menu" onClick={() => setIsDrawerOpen(false)}>
                <X size={22} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <div className="mbn-drawer-body">
              <div className="mbn-drawer-primary">
                {primaryItems.map((item) => (
                  <Link key={item.to} to={item.to} aria-current={isActive(item.to) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                ))}
              </div>

              {resourceGroups.map((group) => (
                <div className="mbn-drawer-group" key={group.title}>
                  <p className="mbn-col-title">{group.title}</p>
                  {group.items.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} aria-current={isActive(to) ? 'page' : undefined}>
                      <Icon size={20} strokeWidth={2} aria-hidden="true" />
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="mbn-drawer-auth">
                <Link to="/login" className="mbn-signin">Se connecter</Link>
                <Link to="/register" className="mbn-join">Rejoindre</Link>
              </div>
            )}
          </nav>
        </>,
        document.body
      )}
    </>
  )
}
