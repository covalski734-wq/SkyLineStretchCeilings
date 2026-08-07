import { useState } from 'react'
import { site } from '../data.js'
import { getRecaptchaToken } from '../lib/recaptcha.js'
import { readUtm } from '../lib/utm.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// WhatsApp first and preselected — the brief names it the primary conversion.
const METHODS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    fieldLabel: 'WhatsApp number',
    placeholder: '+1 604 000 0000',
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
  {
    id: 'phone',
    label: 'Phone call',
    fieldLabel: 'Phone number',
    placeholder: '+1 604 000 0000',
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
  },
  {
    id: 'email',
    label: 'Email',
    fieldLabel: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    inputMode: 'email',
    autoComplete: 'email',
  },
]

function validate({ name, method, contactValue }) {
  const found = {}

  if (!name.trim()) found.name = 'Please enter your name.'

  const value = contactValue.trim()
  if (!value) {
    found.contact_value =
      method === 'email'
        ? 'Please enter your email address.'
        : 'Please enter your phone number.'
  } else if (method === 'email') {
    if (!EMAIL_RE.test(value)) {
      found.contact_value = 'Enter a valid email address.'
    }
  } else {
    // Permissive on formatting — accepts +1 604 555 0123, (604) 555-0123 and
    // international numbers — but rejects anything too short to be real.
    const digits = value.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      found.contact_value = 'Enter a valid phone number, including area code.'
    }
  }

  return found
}

export default function Contact() {
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const [method, setMethod] = useState('whatsapp')
  const [name, setName] = useState('')
  const [contactValue, setContactValue] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [errors, setErrors] = useState({})

  const active = METHODS.find((m) => m.id === method)
  const sending = status === 'sending'

  function selectMethod(id) {
    if (id === method) return
    setMethod(id)
    // What counts as valid changes with the method — start the field clean.
    setContactValue('')
    setErrors((prev) => ({ ...prev, contact_value: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (sending) return

    const found = validate({ name, method, contactValue })
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus('sending')
    setError('')

    try {
      const recaptchaToken = await getRecaptchaToken('lead')
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact_method: method,
          contact_value: contactValue.trim(),
          message: message.trim(),
          website,
          ...readUtm(),
          recaptchaToken,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.message || `Request failed (${response.status})`)
      }

      setName('')
      setContactValue('')
      setMessage('')
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
              <div className="form__field">
                <label className="form__label" htmlFor="cf-name">
                  Full name
                </label>
                <input
                  id="cf-name"
                  className={`field${errors.name ? ' is-invalid' : ''}`}
                  name="name"
                  autoComplete="name"
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'cf-name-err' : undefined}
                />
                {errors.name && (
                  <div className="form__field-error" id="cf-name-err" role="alert">
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Method and value are one idea, so they share one control:
                  picking WhatsApp already labels the field next to it. */}
              <div className="form__field">
                <span className="form__label" id="cf-reach-label">
                  How should we reach you?
                </span>
                <div
                  className={`combo${errors.contact_value ? ' is-invalid' : ''}`}
                >
                  <span className="combo__select">
                    <select
                      id="cf-method"
                      name="contact_method"
                      aria-label="Preferred contact method"
                      value={method}
                      onChange={(e) => selectMethod(e.target.value)}
                    >
                      {METHODS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </span>
                  <input
                    id="cf-contact"
                    className="combo__input"
                    name="contact_value"
                    type={active.type}
                    inputMode={active.inputMode}
                    placeholder={active.placeholder}
                    autoComplete={active.autoComplete}
                    aria-label={active.fieldLabel}
                    maxLength={160}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    aria-invalid={Boolean(errors.contact_value)}
                    aria-describedby={
                      errors.contact_value ? 'cf-contact-err' : undefined
                    }
                  />
                </div>
                {errors.contact_value && (
                  <div
                    className="form__field-error"
                    id="cf-contact-err"
                    role="alert"
                  >
                    {errors.contact_value}
                  </div>
                )}
              </div>

              <div className="form__field">
                <label className="form__label" htmlFor="cf-msg">
                  Project details <span className="form__hint">(optional)</span>
                </label>
                <textarea
                  id="cf-msg"
                  className="field field--area"
                  name="message"
                  rows="4"
                  maxLength={2000}
                  placeholder="Tell us about your project — room, approx. size, preferred ceiling finish and lighting..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
