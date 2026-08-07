// Serverless lead handler. Deploys as-is on Vercel (any framework — the
// /api directory is picked up automatically); in `npm run dev` it is mounted
// by the middleware in vite.config.js so the form works locally too.
//
// Env vars (server-side only, never in the client bundle):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   — required
//   RECAPTCHA_SECRET                       — optional; skipped when unset

const RECAPTCHA_TIMEOUT_MS = 4000
const TELEGRAM_TIMEOUT_MS = 8000
// Mobile devices routinely score 0.3–0.5, so anything higher rejects real leads.
const MIN_SCORE = 0.3

const LIMITS = {
  name: 120,
  contactValue: 160,
  message: 2000,
  utm: 200,
}

const CONTACT_METHODS = {
  whatsapp: 'WhatsApp',
  phone: 'Phone',
  email: 'Email',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]

/** Telegram parses our message as HTML — unescaped input would break it. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Same, plus quotes — safe to drop inside an href="…". */
function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

/** Makes the lead one tap to answer from Telegram. */
function contactLink(method, value) {
  const digits = value.replace(/\D/g, '')
  if (method === 'whatsapp' && digits) return `https://wa.me/${digits}`
  if (method === 'phone' && digits) return `tel:+${digits}`
  if (method === 'email') return `mailto:${escapeAttr(value)}`
  return null
}

function field(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

async function postWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const body = req.body || {}

  // Honeypot: real users never fill a hidden field. Answer 200 so bots do not
  // learn they were caught, but drop the submission.
  if (field(body.website, 50)) {
    return res.status(200).json({ success: true })
  }

  const name = field(body.name, LIMITS.name)
  const method = field(body.contact_method, 20).toLowerCase()
  const contactValue = field(body.contact_value, LIMITS.contactValue)
  const message = field(body.message, LIMITS.message)

  if (!name || !contactValue || !CONTACT_METHODS[method]) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  // Re-check the format server-side; the client validation is only UX.
  const contactOk =
    method === 'email'
      ? EMAIL_RE.test(contactValue)
      : /^\d{10,15}$/.test(contactValue.replace(/\D/g, ''))

  if (!contactOk) {
    return res.status(400).json({ message: 'Invalid contact details' })
  }

  // reCAPTCHA v3 — optional: skip when the token or the secret is absent.
  const recaptchaSecret = process.env.RECAPTCHA_SECRET
  if (recaptchaSecret && body.recaptchaToken) {
    try {
      const verification = await postWithTimeout(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: body.recaptchaToken,
          }),
        },
        RECAPTCHA_TIMEOUT_MS
      )
      const result = await verification.json()
      if (!result.success || result.score < MIN_SCORE) {
        return res
          .status(403)
          .json({ message: 'Failed reCAPTCHA verification', score: result.score })
      }
    } catch {
      // Timeout or network error — let the lead through rather than lose it.
    }
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res
      .status(500)
      .json({ success: false, error: 'Telegram is not configured' })
  }

  const utmLines = UTM_KEYS.map((key) => {
    const value = field(body[key], LIMITS.utm)
    if (!value) return ''
    const label = key.replace('utm_', 'UTM ')
    return `<b>${label[0].toUpperCase()}${label.slice(1)}:</b> ${escapeHtml(value)}`
  })
    .filter(Boolean)
    .join('\n')

  const href = contactLink(method, contactValue)
  const shownContact = href
    ? `<a href="${href}">${escapeHtml(contactValue)}</a>`
    : escapeHtml(contactValue)

  const lines = [
    '<b>📩 New Lead — SkyLine Stretch Ceilings</b>',
    '',
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Preferred contact:</b> ${CONTACT_METHODS[method]}`,
    `<b>${CONTACT_METHODS[method]}:</b> ${shownContact}`,
    message ? `<b>Message:</b> ${escapeHtml(message)}` : '',
  ].filter(Boolean)

  const text = lines.join('\n') + (utmLines ? `\n\n${utmLines}` : '')

  try {
    const response = await postWithTimeout(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
      TELEGRAM_TIMEOUT_MS
    )

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data })
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) })
  }
}
