import { InstrumentGlyph } from './glyphs'
import './BentoCulture.css'

export const BentoCulture = () => {
  return (
    <section className="section bento-section">
      <div className="section-head">
        <div>
          <div className="section-num">02 / Culture &amp; traditions</div>
          <h2 className="section-h2">
            Une <em>mosaïque vivante</em> de rituels, de sons, de saveurs.
          </h2>
        </div>
        <p className="section-lead">
          Musique, arts, cuisine, histoire, langues : six portes d'entrée sur le patrimoine africain.
        </p>
      </div>

      <div className="bento">
        <article className="bento-card b-music">
          <div className="bento-visual" data-label="MUSIQUE" />
          <InstrumentGlyph className="bento-instrument-glyph" size={140} />
          <div className="bento-card-content">
            <div className="bento-kicker">01 · Sonorités</div>
            <h3 className="bento-card-title">Les rythmes qui ont façonné le monde.</h3>
            <p className="bento-card-p">
              Du jazz au reggae, de l'afrobeat au mbalax, la musique africaine irrigue la culture
              mondiale.
            </p>
          </div>
        </article>

        <article className="bento-card b-arts">
          <div className="bento-kicker">02 · Arts</div>
          <h3 className="bento-card-title">Masques, sculptures, tissus kente et wax.</h3>
          <p className="bento-card-p">
            Chaque œuvre raconte une lignée, préserve un savoir, transmet une histoire.
          </p>
        </article>

        <article className="bento-card b-history">
          <div className="bento-kicker">03 · Histoire</div>
          <h3 className="bento-card-title">Des empires qui ont écrit l'histoire.</h3>
          <div className="bento-timeline">
            <div className="bento-timeline-item">
              <div className="bento-timeline-year">-3100</div>
              <div>Égypte</div>
            </div>
            <div className="bento-timeline-sep" />
            <div className="bento-timeline-item">
              <div className="bento-timeline-year">1235</div>
              <div>Mali</div>
            </div>
            <div className="bento-timeline-sep" />
            <div className="bento-timeline-item">
              <div className="bento-timeline-year">1464</div>
              <div>Songhaï</div>
            </div>
          </div>
        </article>

        <article className="bento-card b-food">
          <div className="bento-kicker">04 · Cuisine</div>
          <h3 className="bento-card-title">Couscous, jollof, injera, thieb, fufu.</h3>
          <p className="bento-card-p">Une géographie des saveurs, chaque pays sa signature.</p>
          <div className="bento-dots">
            <div className="bento-dot" />
            <div className="bento-dot" />
            <div className="bento-dot" />
            <div className="bento-dot" />
            <div className="bento-dot" />
          </div>
        </article>

        <article className="bento-card b-lang">
          <div className="bento-kicker">05 · Langues</div>
          <div className="bento-count">2 000+</div>
          <p className="bento-card-p">
            Plus d'un quart des langues du monde, portées par les griots et les poètes.
          </p>
        </article>

        <article className="bento-card b-heal">
          <div className="bento-kicker">06 · Médecine</div>
          <h3 className="bento-card-title">Baobab, moringa, karité.</h3>
          <p className="bento-card-p">Pharmacopée vivante, transmise depuis des millénaires.</p>
        </article>
      </div>
    </section>
  )
}
