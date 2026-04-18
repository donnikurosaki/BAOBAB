import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, MapPin, Users, Languages } from 'lucide-react'
import { getFlagUrl } from '../../utils/flags'
import type { AfricanCountry } from '../../data/allAfricanCountries'

interface CountryDetailPanelProps {
  country: AfricanCountry
}

export const CountryDetailPanel = ({ country }: CountryDetailPanelProps) => {
  const tags = country.tags && country.tags.length > 0 ? country.tags : country.languages

  return (
    <aside className="country-panel" aria-live="polite">
      <div className="country-panel-head">
        <div className="country-flag">
          <img
            src={getFlagUrl(country.id, 'w160')}
            alt={`Drapeau ${country.nameFr}`}
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              target.parentElement!.style.backgroundColor = country.color
            }}
          />
        </div>
        <div>
          <div className="country-code-kicker">{country.id}</div>
          <h3 className="country-name">{country.nameFr}</h3>
          <div className="country-capital">
            <MapPin size={12} />
            {country.capital}
          </div>
        </div>
      </div>

      <div className="country-stats">
        <div className="country-stat">
          <div className="country-stat-label">Capitale</div>
          <div className="country-stat-value">{country.capital}</div>
        </div>
        <div className="country-stat">
          <div className="country-stat-label">Population</div>
          <div className="country-stat-value">{country.population}</div>
        </div>
        <div className="country-stat">
          <div className="country-stat-label">Superficie</div>
          <div className="country-stat-value">{country.area}</div>
        </div>
        <div className="country-stat">
          <div className="country-stat-label">Monnaie</div>
          <div className="country-stat-value">{country.currency}</div>
        </div>
        <div className="country-stat country-stat-wide">
          <div className="country-stat-label">
            <Languages size={10} />
            Langues
          </div>
          <div className="country-stat-value">{country.languages.join(' · ')}</div>
        </div>
      </div>

      <p className="country-description">{country.description}</p>

      <div className="country-tags">
        {tags.slice(0, 6).map((tag, idx) => (
          <span key={idx} className="country-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="country-actions">
        <Link to={`/country/${country.id}`} className="hero-btn hero-btn-primary">
          Découvrir {country.nameFr}
          <ArrowRight size={16} />
        </Link>
        <Link to={`/shop?country=${country.id}`} className="hero-btn">
          <ShoppingBag size={16} />
          Produits du pays
        </Link>
      </div>

      <div className="country-footer">
        <Users size={12} />
        <span>{country.culture.length > 120 ? country.culture.slice(0, 120) + '…' : country.culture}</span>
      </div>
    </aside>
  )
}
