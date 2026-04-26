import { useState } from 'react'
import { usePlatformName } from '../../hooks/usePlatformName'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
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
    <path
      fill="currentColor"
      d="M 40 7 C 68 1 82 1 95 2 C 105 12 107 16 108 17 C 130 20 155 22 172 25 L 165 29 C 175 50 190 76 201 98 L 225 96 C 227 99 228 101 228 103 C 220 118 208 132 200 148 C 196 155 192 158 191 162 C 191 175 191 182 191 188 C 183 200 178 206 175 212 C 171 224 169 233 168 242 C 150 263 136 274 125 279 C 121 279 117 278 112 277 C 103 267 99 260 97 255 C 97 236 97 223 98 212 C 98 190 98 179 98 168 C 93 159 89 153 88 148 C 78 138 73 133 68 129 C 60 126 56 125 52 125 C 45 125 42 125 38 125 C 31 126 26 127 22 127 C 19 121 16 118 15 114 C 11 110 9 108 8 106 C 4 99 1 94 0 88 C 1 77 2 71 2 64 C 7 50 11 43 15 37 C 15 29 15 25 15 21 C 23 14 31 10 40 7 Z"
    />
  </svg>
)

export const Register = () => {
  const platformName = usePlatformName()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left decorative panel ── */}
      <aside className="auth-panel">
        <PanelRings />
        <PanelAfrica />

        <div className="auth-panel-brand">
          <div className="auth-panel-logo">{platformName}</div>
          <div className="auth-panel-tagline">Héritage &amp; Culture Africaine</div>
        </div>

        <div className="auth-panel-center" />

        <blockquote className="auth-panel-quote">
          "Rejoignez une communauté qui célèbre et préserve la richesse de la culture africaine."
          <cite>{platformName}</cite>
        </blockquote>
      </aside>

      {/* ── Right form panel ── */}
      <main className="auth-form-panel">
        <div className="auth-form-wrapper">

          <div className="auth-form-header">
            <span className="auth-overtitle">Nouveau compte</span>
            <h1 className="auth-form-title">Inscription</h1>
            <p className="auth-form-subtitle">Rejoignez la communauté {platformName}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Name */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-name">Nom</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><User size={16} /></span>
                <input
                  id="reg-name"
                  type="text"
                  className="auth-field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-email">Email</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Mail size={16} /></span>
                <input
                  id="reg-email"
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

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-password">Mot de passe</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock size={16} /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-field-input has-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-field-label" htmlFor="reg-confirm">Confirmer le mot de passe</label>
              <div className="auth-field-wrap">
                <span className="auth-field-icon"><Lock size={16} /></span>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-field-input has-toggle"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
              {loading ? 'Inscription…' : "S'inscrire"}
            </button>

          </form>

          <p className="auth-switch">
            Déjà un compte ?
            <Link to="/auth/login">Se connecter</Link>
          </p>

        </div>
      </main>

    </div>
  )
}
