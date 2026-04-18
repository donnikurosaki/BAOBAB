import { useState, useEffect } from 'react'
import { usePlatformName } from '../hooks/usePlatformName'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ShoppingBag,
  BarChart3,
  Shield,
  GraduationCap,
  Users2,
  Award,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
} from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Card } from '../components/Card/Card'
import { Button } from '../components/Button/Button'
import { HeroSplit } from '../components/Home/HeroSplit'
import { MapSection } from '../components/Home/MapSection'
import { BentoCulture } from '../components/Home/BentoCulture'
import { NumbersSection } from '../components/Home/NumbersSection'
import { homeService } from '../services/api'
import './Home.css'

interface HomeStats {
  countries: number
  blogPosts: number
  products: number
  events: number
  figures: number
  stories: number
  collections: number
  users: number
  totalViews: number
}

export const Home = () => {
  const platformName = usePlatformName()
  const [stats, setStats] = useState<HomeStats | null>(null)
  const [featuredContent, setFeaturedContent] = useState<any>(null)
  const [trendingContent, setTrendingContent] = useState<any>(null)
  const [recentContent, setRecentContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true)
        const [statsRes, featuredRes, trendingRes, recentRes] = await Promise.all([
          homeService.getStats().catch(() => ({ data: null })),
          homeService.getFeatured({ limit: 6 }).catch(() => ({ data: null })),
          homeService.getTrending({ limit: 5, period: '7d' }).catch(() => ({ data: null })),
          homeService.getRecent({ limit: 6 }).catch(() => ({ data: null })),
        ])

        if (statsRes.data) setStats(statsRes.data)
        if (featuredRes.data) setFeaturedContent(featuredRes.data)
        if (trendingRes.data) setTrendingContent(trendingRes.data)
        if (recentRes.data) setRecentContent(recentRes.data)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  return (
    <Layout>
      <div className="home">
        <HeroSplit />

        <MapSection />

        <BentoCulture />

        <NumbersSection stats={stats ? { countries: stats.countries } : undefined} />

        {featuredContent && !loading && (
          <section className="section featured-section">
            <div className="section-head">
              <div>
                <div className="section-num">04 / Contenus en vedette</div>
                <h2 className="section-h2">
                  Notre <em>sélection éditoriale</em> du moment.
                </h2>
              </div>
              <p className="section-lead">
                Articles et produits mis en avant par la rédaction pour explorer le continent.
              </p>
            </div>

            <div className="featured-content">
              {featuredContent.blogs && featuredContent.blogs.length > 0 && (
                <div className="featured-category">
                  <h3 className="subsection-title">
                    <Star size={18} /> Articles populaires
                  </h3>
                  <div className="featured-grid">
                    {featuredContent.blogs.slice(0, 3).map((blog: any) => (
                      <Card key={blog._id} className="featured-item">
                        {blog.image && (
                          <div className="featured-image">
                            <img src={blog.image} alt={blog.title} />
                          </div>
                        )}
                        <div className="featured-content-text">
                          <span className="featured-category-tag">{blog.category}</span>
                          <h4>{blog.title}</h4>
                          <p>{blog.excerpt || blog.title}</p>
                          <Link to={`/blog/${blog._id}`}>
                            <Button variant="outline" size="small">
                              Lire
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {featuredContent.products && featuredContent.products.length > 0 && (
                <div className="featured-category">
                  <h3 className="subsection-title">
                    <ShoppingBag size={18} /> Produits en vedette
                  </h3>
                  <div className="featured-grid">
                    {featuredContent.products.slice(0, 3).map((product: any) => (
                      <Card key={product._id} className="featured-item">
                        {product.images && product.images[0] && (
                          <div className="featured-image">
                            <img src={product.images[0]} alt={product.name} />
                          </div>
                        )}
                        <div className="featured-content-text">
                          <span className="featured-category-tag">{product.category}</span>
                          <h4>{product.name}</h4>
                          <p className="featured-price">
                            {product.price?.toLocaleString()} {product.currency || 'FCFA'}
                          </p>
                          <Link to={`/shop`}>
                            <Button variant="outline" size="small">
                              Voir
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {trendingContent && !loading && (
          <section className="section trending-section">
            <div className="section-head">
              <div>
                <div className="section-num">05 / Tendances</div>
                <h2 className="section-h2">
                  Ce que la <em>communauté</em> lit en ce moment.
                </h2>
              </div>
              <p className="section-lead">Le pouls éditorial de la plateforme sur sept jours.</p>
            </div>
            <div className="trending-content">
              {trendingContent.blogs && trendingContent.blogs.length > 0 && (
                <div className="trending-category">
                  <h3 className="subsection-title">
                    <TrendingUp size={18} /> Articles tendance
                  </h3>
                  <div className="trending-list">
                    {trendingContent.blogs.map((blog: any) => (
                      <Card key={blog._id} className="trending-item">
                        <div className="trending-item-content">
                          {blog.image && (
                            <div className="trending-item-image">
                              <img src={blog.image} alt={blog.title} />
                            </div>
                          )}
                          <div className="trending-item-text">
                            <h4>{blog.title}</h4>
                            <div className="trending-meta">
                              <span>{blog.views} vues</span>
                              <span className="trending-category-tag">{blog.category}</span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/blog/${blog._id}`}>
                          <Button variant="outline" size="small">
                            Lire
                          </Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {recentContent && !loading && (
          <section className="section recent-section">
            <div className="section-head">
              <div>
                <div className="section-num">06 / Actualités</div>
                <h2 className="section-h2">
                  Les <em>derniers ajouts</em> de la plateforme.
                </h2>
              </div>
              <p className="section-lead">Événements historiques et figures inspirantes récemment publiés.</p>
            </div>
            <div className="recent-content">
              {recentContent.events && recentContent.events.length > 0 && (
                <div className="recent-category">
                  <h3 className="subsection-title">
                    <Clock size={18} /> Événements récents
                  </h3>
                  <div className="recent-grid">
                    {recentContent.events.slice(0, 3).map((event: any) => (
                      <Card key={event._id} className="recent-item">
                        <div className="recent-item-content">
                          <h4>{event.title}</h4>
                          <p>
                            {event.shortDescription || event.description?.substring(0, 100)}...
                          </p>
                          <div className="recent-meta">
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                            {event.location?.country && (
                              <span>{event.location.country.nameFr}</span>
                            )}
                          </div>
                          <Link to={`/timeline/${event._id}`}>
                            <Button variant="outline" size="small">
                              En savoir plus
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {recentContent.figures && recentContent.figures.length > 0 && (
                <div className="recent-category">
                  <h3 className="subsection-title">
                    <Users2 size={18} /> Figures historiques récentes
                  </h3>
                  <div className="recent-grid">
                    {recentContent.figures.slice(0, 3).map((figure: any) => (
                      <Card key={figure._id} className="recent-item">
                        <div className="recent-item-content">
                          {figure.image && (
                            <div className="recent-item-image">
                              <img src={figure.image} alt={figure.name} />
                            </div>
                          )}
                          <h4>{figure.name}</h4>
                          {figure.nameNative && (
                            <p className="recent-native-name">{figure.nameNative}</p>
                          )}
                          <p>{figure.shortBiography?.substring(0, 100)}...</p>
                          <Link to={`/figures/${figure._id}`}>
                            <Button variant="outline" size="small">
                              Voir la biographie
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="section values-section">
          <div className="section-head">
            <div>
              <div className="section-num">07 / Nos valeurs</div>
              <h2 className="section-h2">
                Une plateforme bâtie sur <em>quatre piliers</em>.
              </h2>
            </div>
            <p className="section-lead">
              L'ADN éditorial de BAOBAB, de la sélection des produits à la narration du continent.
            </p>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <Shield size={24} className="value-icon" />
              <h3>Authenticité</h3>
              <p>Des produits et contenus authentiques directement issus du continent africain.</p>
            </div>
            <div className="value-card">
              <GraduationCap size={24} className="value-icon" />
              <h3>Éducation</h3>
              <p>Partageons l'histoire riche et diverse de l'Afrique à travers notre blog.</p>
            </div>
            <div className="value-card">
              <Users2 size={24} className="value-icon" />
              <h3>Communauté</h3>
              <p>Rejoignez une communauté passionnée par la culture africaine.</p>
            </div>
            <div className="value-card">
              <Award size={24} className="value-icon" />
              <h3>Qualité</h3>
              <p>Des produits sélectionnés avec soin pour leur qualité exceptionnelle.</p>
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="cta-inner">
            <div className="cta-kicker">08 / Explorez {platformName}</div>
            <h2 className="cta-title">
              Un pas de plus <em>vers le continent</em>.
            </h2>
            <p className="cta-lead">
              Plongez dans le blog, parcourez la boutique, ou rejoignez la communauté depuis votre
              tableau de bord.
            </p>
            <div className="cta-actions">
              <Link to="/blog" className="cta-card">
                <BookOpen size={22} />
                <div>
                  <strong>Blog</strong>
                  <span>Retracez l'histoire fascinante de l'Afrique</span>
                </div>
                <ArrowRight size={16} className="cta-arrow" />
              </Link>
              <Link to="/shop" className="cta-card">
                <ShoppingBag size={22} />
                <div>
                  <strong>Boutique</strong>
                  <span>Produits africains authentiques</span>
                </div>
                <ArrowRight size={16} className="cta-arrow" />
              </Link>
              <Link to="/login" className="cta-card">
                <BarChart3 size={22} />
                <div>
                  <strong>Dashboard</strong>
                  <span>Suivez votre activité et vos commandes</span>
                </div>
                <ArrowRight size={16} className="cta-arrow" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
