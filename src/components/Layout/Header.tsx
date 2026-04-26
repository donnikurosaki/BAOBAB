import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { AdvancedSearch } from "../Search/AdvancedSearch";
import {
  Home,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Folder,
  HelpCircle,
  Globe,
  Quote,
  Ellipsis,
  FileText,
  LayoutDashboard,
  Search,
  User,
  Clock,
  Users,
  Settings,
  LogOut,
  X,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import "./Header.css";

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { settings, fetchSettings } = useSettingsStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Détecter le scroll pour réduire la navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Fermer le menu "Plus" quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        moreButtonRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isMoreMenuOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreMenuOpen, isUserMenuOpen]);

  const platformName = settings?.platformName || "BAOBAB";

  // Navigation principale (toujours visible sur desktop)
  const mainNavItems = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/blog", label: "Blog", icon: BookOpen },
    { to: "/shop", label: "Boutique", icon: ShoppingBag },
  ];

  // Navigation secondaire (menu déroulant "Plus")
  const secondaryNavItems = [
    { to: "/timeline", label: "Chronologie", icon: Clock },
    { to: "/figures", label: "Personnages", icon: User },
    { to: "/collections", label: "Collections", icon: Folder },
    { to: "/stories", label: "Récits", icon: BookOpen },
    { to: "/quizzes", label: "Quiz", icon: HelpCircle },
    { to: "/proverbs", label: "Proverbes", icon: Quote },
    { to: "/map", label: "Carte", icon: Globe },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`header ${isScrolled ? "scrolled" : ""}`}
    >
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">🌳</span>
          <span className="logo-text">{platformName}</span>
        </Link>

        {/* Navigation principale - Desktop uniquement */}
        <nav className="header-nav-desktop">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} />
                <span className="nav-link-text">{item.label}</span>
              </Link>
            );
          })}

          {/* Menu "Plus" pour navigation secondaire */}
          <div className="nav-secondary" ref={moreMenuRef}>
            <button
              ref={moreButtonRef}
              className={`nav-more-btn ${isMoreMenuOpen ? "active" : ""}`}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              aria-label="Plus d'options"
            >
              <Ellipsis />
              <span className="nav-link-text">Plus</span>
            </button>
            <div className={`nav-dropdown ${isMoreMenuOpen ? "active" : ""}`}>
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="nav-dropdown-item"
                  onClick={() => setIsMoreMenuOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Actions utilisateur */}
        <div className="header-actions">
          {/* Bouton recherche compact */}
          <button
            className="search-toggle-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Rechercher"
          >
            <Search />
          </button>

          {/* Panier */}
          {isAuthenticated && (
            <Link to="/cart" className="cart-link" aria-label="Panier">
              <ShoppingCart size={18} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {/* Toggle thème */}
          <ThemeToggle />

          {/* Menu utilisateur */}
          {isAuthenticated ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                ref={userButtonRef}
                className="user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Menu utilisateur"
              >
                <span className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <ChevronDown size={16} style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>
              <div
                className={`user-dropdown ${isUserMenuOpen ? "active" : ""}`}
              >
                <div className="user-dropdown-header">
                  <div className="user-info">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="user-dropdown-menu">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                  <Link
                    to="/communities"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Users size={18} />
                    Communautés
                  </Link>
                  {user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                      <Settings size={18} />
                      Administration
                    </Link>
                  )}
                  <div className="user-dropdown-divider" />
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link auth-link-button">
                Connexion
              </Link>
              <Link to="/register" className="auth-link auth-link-primary">
                Inscription
              </Link>
            </div>
          )}

          {/* Menu hamburger pour mobile */}
          <button
            className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Barre de recherche expandable */}
      {isSearchOpen && (
        <div className="header-search-expanded">
          <AdvancedSearch />
          <button
            className="search-close-btn"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Fermer la recherche"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Menu mobile */}
      <nav className={`header-nav-mobile ${isMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-content">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="mobile-nav-divider" />

          {secondaryNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAuthenticated && (
            <>
              <div className="mobile-nav-divider" />
              <Link
                to="/dashboard"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/communities"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} />
                <span>Communautés</span>
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Administration</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
