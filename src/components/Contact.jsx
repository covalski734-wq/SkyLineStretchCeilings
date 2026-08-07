import { useState } from 'react'
import { site } from '../data.js'
import { getRecaptchaToken } from '../lib/recaptcha.js'
import { readUtm } from '../lib/utm.js'

export default function Contact() {
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    setStatus('sending')
    setError('')

    try {
      const recaptchaToken = await getRecaptchaToken('lead')
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...readUtm(), recaptchaToken }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.message || `Request failed (${response.status})`)
      }

      form.reset()
      setStatus('sent')
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong.'
      )
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <section id="contact" className="section">
      <div className="contact-shell" data-reveal>
        <div className="contact-card">
          <div className="contact-head">
            <div className="eyebrow">Free quote</div>
            <h2 className="h2 h2--sm">Request your free measurement</h2>
            <p className="lead">
              Tell us about your space and we'll get back to you within one
              business day with a no‑obligation quote.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="thanks">
              <div className="thanks__mark">✓</div>
              <h3 className="thanks__title">Thank you.</h3>
              <p className="thanks__text">
                Your request has been received. We'll be in touch shortly.
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit} noValidate={false}>
              <div className="form__row">
                <input
                  className="field"
                  name="name"
                  placeholder="Full name"
                  aria-label="Full name"
                  autoComplete="name"
                  maxLength={120}
                  required
                />
                <input
                  className="field"
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  aria-label="Phone"
                  autoComplete="tel"
                  maxLength={60}
                  required
                />
              </div>

              <input
                className="field field--block"
                name="email"
                type="email"
                placeholder="Email"
                aria-label="Email"
                autoComplete="email"
                maxLength={160}
              />

              <textarea
                className="field field--area"
                name="message"
                rows="4"
                maxLength={2000}
                placeholder="Tell us about your project — rooms, approx. size, finish you have in mind…"
                aria-label="Project details"
              />

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <input
                className="form__honeypot"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <button type="submit" className="form__submit" disabled={sending}>
                {sending ? 'Sending…' : 'Request My Free Quote'}
              </button>

              {status === 'error' && (
                <p className="form__error" role="alert">
                  {error} Please try again, or message us on{' '}
                  <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                  .
                </p>
              )}

              <div className="form__alt">
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="form__whatsapp"
                >
                  Prefer to chat? Message us on WhatsApp
                </a>
                <p className="form__note">
                  Or call us at{' '}
                  <a href={site.phoneHref} style={{ fontWeight: 600 }}>
                    {site.phone}
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
