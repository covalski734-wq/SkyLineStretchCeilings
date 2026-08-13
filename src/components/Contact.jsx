import { useState } from 'react'
import { site } from '../data.js'
import { getRecaptchaToken } from '../lib/recaptcha.js'
import { readUtm } from '../lib/utm.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Canadian format A1A 1A1, space or hyphen optional.
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/

const EMPTY = { name: '', phone: '', email: '', postal: '', message: '' }

function validate({ name, phone, email, postal }) {
  const found = {}

  if (!name.trim()) found.name = 'Please enter your name.'

  if (!phone.trim()) {
    found.phone = 'Please enter your phone number.'
  } else {
    // Permissive on formatting — accepts +1 604 555 0123 and (604) 555-0123 —
    // but rejects anything too short to be real.
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      found.phone = 'Enter a valid phone number, including area code.'
    }
  }

  if (email.trim() && !EMAIL_RE.test(email.trim())) {
    found.email = 'Enter a valid email address.'
  }

  if (!postal.trim()) {
    found.postal = 'Please enter your postal code.'
  } else if (!POSTAL_RE.test(postal.trim())) {
    found.postal = 'Enter a valid postal code, for example V6B 1A1.'
  }

  return found
}

export default function Contact() {
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const [values, setValues] = useState(EMPTY)
  const [website, setWebsite] = useState('') // honeypot
  const [errors, setErrors] = useState({})

  const sending = status === 'sending'
  const set = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (sending) return

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus('sending')
    setError('')

    try {
      const recaptchaToken = await getRecaptchaToken('lead')
      const response = await fetch('functions/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          postal_code: values.postal.trim().toUpperCase(),
          message: values.message.trim(),
          website,
          ...readUtm(),
          recaptchaToken,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.message || `Request failed (${response.status})`)
      }

      setValues(EMPTY)
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

  const field = (key, label, props = {}) => (
    <div className="form__field">
      <label className="form__label" htmlFor={`cf-${key}`}>
        {label}
        {props.optional && <span className="form__hint"> (optional)</span>}
      </label>
      <input
        id={`cf-${key}`}
        className={`field${errors[key] ? ' is-invalid' : ''}`}
        name={props.name || key}
        type={props.type || 'text'}
        inputMode={props.inputMode}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `cf-${key}-err` : undefined}
      />
      {errors[key] && (
        <div className="form__field-error" id={`cf-${key}-err`} role="alert">
          {errors[key]}
        </div>
      )}
    </div>
  )

  return (
    <section id="contact" className="section">
      <div className="contact-shell" data-reveal>
        <div className="contact-card">
          <div className="contact-head">
            <div className="eyebrow">Free quote</div>
            <h2 className="h2 h2--sm">Request your free estimate</h2>
            <p className="lead">
              Tell us about your space and we’ll help you plan the right ceiling
              and lighting solution.
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
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="form__row">
                {field('name', 'Full name', {
                  placeholder: 'First and last name',
                  autoComplete: 'name',
                  maxLength: 120,
                })}
                {field('phone', 'Phone', {
                  type: 'tel',
                  inputMode: 'tel',
                  placeholder: '+1 604 000 0000',
                  autoComplete: 'tel',
                  maxLength: 60,
                })}
              </div>

              <div className="form__row">
                {field('email', 'Email', {
                  type: 'email',
                  inputMode: 'email',
                  placeholder: 'you@example.com',
                  autoComplete: 'email',
                  maxLength: 160,
                  optional: true,
                })}
                {field('postal', 'Postal code', {
                  name: 'postal_code',
                  inputMode: 'text',
                  placeholder: 'V6B 1A1',
                  autoComplete: 'postal-code',
                  maxLength: 10,
                })}
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="cf-message">
                  Project details <span className="form__hint">(optional)</span>
                </label>
                <textarea
                  id="cf-message"
                  className="field field--area"
                  name="message"
                  rows="4"
                  maxLength={2000}
                  placeholder="Tell us about your project — room, approx. size, preferred ceiling finish and lighting..."
                  value={values.message}
                  onChange={set('message')}
                />
              </div>

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <input
                className="form__honeypot"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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
