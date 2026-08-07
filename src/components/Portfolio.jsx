import { useCallback, useState } from 'react'
import { works } from '../data.js'
import Lightbox from './Lightbox.jsx'

export default function Portfolio() {
  const [openIndex, setOpenIndex] = useState(null)

  const step = useCallback(
    (dir) =>
      setOpenIndex((i) =>
        i === null ? i : (i + dir + works.length) % works.length
      ),
    []
  )

  return (
    <section id="portfolio" className="section section--alt">
      <div className="container" data-reveal>
        <div className="portfolio-head">
          <div>
            <div className="eyebrow">Recent installs</div>
            <h2 className="h2">Our work</h2>
          </div>
          <a href="#contact" className="portfolio-link">
            Start your project →
          </a>
        </div>

        <div className="work-grid">
          {works.map((w, i) => (
            <button
              key={w.title}
              type="button"
              className="liftimg work-card"
              style={{ aspectRatio: w.ratio }}
              aria-label={`View ${w.title}`}
              onClick={() => setOpenIndex(i)}
            >
              <img src={w.img} alt={w.title} className="ph-img work-card__img" />
              <div className="work-card__scrim" />
              <div className="work-card__meta">
                <div className="work-card__tag">{w.tag}</div>
                <div className="work-card__title">{w.title}</div>
              </div>
              <span className="work-card__zoom" aria-hidden="true">
                ⤢
              </span>
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        items={works}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onStep={step}
      />
    </section>
  )
}
