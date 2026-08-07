import { useState } from 'react'
import { alsoAvailable, ceilingTypes } from '../data.js'

export default function CeilingTypes() {
  const [open, setOpen] = useState(null)

  return (
    <section id="ceilings" className="section">
      <div className="container" data-reveal>
        <div className="section-head--center">
          <div className="eyebrow">Finishes</div>
          <h2 className="h2" style={{ marginBottom: '16px' }}>
            Stretch ceiling types
          </h2>
          <p className="lead">
            Every finish is available in a wide range of tones. Tap any option
            to see where it works best.
          </p>
        </div>

        <div className="card-grid">
          {ceilingTypes.map((t, i) => {
            const isOpen = open === i
            return (
              <div key={t.name} className="lift type-card">
                <div className="type-card__media">
                  <img
                    src={t.img}
                    alt={`${t.name} stretch ceiling`}
                    className="ph-img"
                  />
                </div>

                <button
                  type="button"
                  className="type-card__toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="type-card__name">{t.name}</span>
                  <span
                    className={`type-card__sign${isOpen ? ' is-open' : ''}`}
                    aria-hidden="true"
                  >
                    {isOpen ? '–' : '+'}
                  </span>
                </button>

                <div
                  className="acc-panel"
                  style={{
                    maxHeight: isOpen ? '260px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="type-card__body">
                    <p className="type-card__desc">{t.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="also">
          <div className="also__label">We also install</div>
          <div className="chips">
            {alsoAvailable.map((item) => (
              <span key={item} className="chip">
                <span className="chip__dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
