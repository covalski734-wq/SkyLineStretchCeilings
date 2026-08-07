import { useState } from 'react'
import { faqs } from '../data.js'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="section">
      <div className="container split faq-split" data-reveal>
        <div className="faq-aside">
          <div className="eyebrow">Good to know</div>
          <h2 className="h2 h2--sm">Frequently asked questions</h2>
          <p className="lead">
            Still unsure about something? Send us a message and we'll answer
            within one business day.
          </p>
          <a href="#contact" className="btn btn--solid-dark">
            Ask a question
          </a>
        </div>

        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className="faq-item">
                <button
                  type="button"
                  className="faq-item__btn"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-item__q">{f.q}</span>
                  <span
                    className={`faq-item__sign${isOpen ? ' is-open' : ''}`}
                    aria-hidden="true"
                  >
                    {isOpen ? '–' : '+'}
                  </span>
                </button>

                <div
                  className="acc-panel"
                  style={{
                    maxHeight: isOpen ? '340px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="faq-item__a">{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
