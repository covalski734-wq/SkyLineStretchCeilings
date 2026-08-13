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
  phone: 60,
  email: 160,
  postal: 10,
  message: 2000,
  utm: 200,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const POSTAL_RE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/

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
function phoneLinks(phone) {
  const digits = phone.replace(/\D/g, '')
  const shown = escapeHtml(phone)
  if (!digits) return shown
  return `<a href="tel:+${digits}">${shown}</a> · <a href="https://wa.me/${digits}">WhatsApp</a>`
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
  const phone = field(body.phone, LIMITS.phone)
  const email = field(body.email, LIMITS.email)
  const postal = field(body.postal_code, LIMITS.postal)
  const message = field(body.message, LIMITS.message)

  if (!name || !phone || !postal) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  // Re-check the formats server-side; the client validation is only UX.
  if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
    return res.status(400).json({ message: 'Invalid phone number' })
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }
  if (!POSTAL_RE.test(postal)) {
    return res.status(400).json({ message: 'Invalid postal code' })
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

  const lines = [
    '<b>📩 New Lead — SkyLine Stretch Ceilings</b>',
    '',
    `<b>Name:</b> ${escapeHtml(name)}`,
    `<b>Phone:</b> ${phoneLinks(phone)}`,
    email
      ? `<b>Email:</b> <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a>`
      : '',
    `<b>Postal code:</b> ${escapeHtml(postal.toUpperCase())}`,
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
