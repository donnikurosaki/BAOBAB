import { useState } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../hooks/useNotifications'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'
import './Auth.css'

const PanelRings = () => (
  <svg viewBox="0 0 380 380" className="auth-panel-rings" aria-hidden="true">
    <circle cx="190" cy="190" r="160" fill="none" stroke="rgba(196,98,45,0.12)" strokeWidth="1" />
    <circle cx="190" cy="190" r="128" fill="none" stroke="rgba(212,175,55,0.09)" strokeWidth="1.5" />
    <circle cx="190" cy="190" r="96"  fill="none" stroke="rgba(196,98,45,0.07)" strokeWidth="1" />
    <circle cx="190" cy="190" r="64"  fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="1.5" />
  </svg>
)

const PanelAfrica = () => (
  <svg viewBox="0 0 230 280" className="auth-panel-africa" aria-hidden="true">
    <path fill="currentColor" d="M 40 7 C 68 1 82 1 95 2 C 105 12 107 16 108 17 C 130 20 155 22 172 25 L 165 29 C 175 50 190 76 201 98 L 225 96 C 227 99 228 101 228 103 C 220 118 208 132 200 148 C 196 155 192 158 191 162 C 191 175 191 182 191 188 C 183 200 178 206 175 212 C 171 224 169 233 168 242 C 150 263 136 274 125 279 C 121 279 117 278 112 277 C 103 267 99 260 97 255 C 97 236 97 223 98 212 C 98 190 98 179 98 168 C 93 159 89 153 88 148 C 78 138 73 133 68 129 C 60 126 56 125 52 125 C 45 125 42 125 38 125 C 31 126 26 127 22 127 C 19 121 16 118 15 114 C 11 110 9 108 8 106 C 4 99 1 94 0 88 C 1 77 2 71 2 64 C 7 50 11 43 15 37 C 15 29 15 25 15 21 C 23 14 31 10 40 7 Z" />
  </svg>
)

export const Login = () => {
  const platformName = usePlatformName()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const { success, error: showError } = useNotifications()

  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      success(`Bienvenue sur ${platformName} !`)
      navigate(redirectTo)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Email ou mot de passe incorrect'
      setError(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Panneau gauche décoratif ── */}
      <aside className="auth-panel">
        <PanelRings />
        <PanelAfrica />
        <div className="auth-panel-brand">
          <div className="auth-panel-logo">{platformName}</div>
          <div className="auth-panel-tagline">Héritage &amp; Culture Africaine</div>
        </div>
        <div className="auth-panel-center" />
        <blockquote className="auth-panel-quote">
          "L'Afrique n'est pas un pays, c'est un univers de cultures, d'histoires et de peuples."
          <cite>Proverbe africain</cite>
        </blockquote>
      </aside>

      {/* ── Panneau droit avec formulaire ── */}
      <main className="auth-form-panel">
        <div className="auth-form-wrapper">

          <Link to="/" className="auth-back">
            <ArrowLeft size={15} />
            Accueil
          </Link>

          <div className="auth-form-header">
            <span className="auth-overtitle">Bienvenue</span>
            <h1 className="auth-form-title">Connexion</h1>
            <p className="auth-form-subtitle">Accédez à votre compte {platformName}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-email">Email</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Mail size={16} /></span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field-label" htmlFor="login-password">Mot de passe</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock size={16} /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-field-input has-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

          </form>

          <p className="auth-switch">
            Pas encore de compte ?
            <Link to="/register">S'inscrire</Link>
          </p>

        </div>
      </main>

    </div>
  )
}
