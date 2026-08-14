// Platform-agnostic lead handler. Knows nothing about Vercel, Cloudflare or
// Vite — it takes a parsed body plus an env object and returns a plain
// { status, body } pair. The thin adapters translate that to each runtime:
//
//   api/lead.js            → Vercel        (req, res)
//   functions/api/lead.js  → Cloudflare    (context) / Response
//   vite.config.js         → local dev     (connect middleware)
//
// Only web-standard APIs are used (fetch, AbortController, URLSearchParams) so
// the same code runs on Node and on the Workers runtime.
//
// Env keys (server-side only, never in the client bundle):
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

/**
 * @param {object}  input
 * @param {object}  input.body  parsed JSON request body
 * @param {object}  input.env   process.env on Node, context.env on Cloudflare
 * @returns {Promise<{ status: number, body: object }>}
 */
export async function handleLead({ body = {}, env = {} }) {
  // Honeypot: real users never fill a hidden field. Answer 200 so bots do not
  // learn they were caught, but drop the submission.
  if (field(body.website, 50)) {
    return { status: 200, body: { success: true } }
  }

  const name = field(body.name, LIMITS.name)
  const phone = field(body.phone, LIMITS.phone)
  const email = field(body.email, LIMITS.email)
  const postal = field(body.postal_code, LIMITS.postal)
  const message = field(body.message, LIMITS.message)

  if (!name || !phone || !email || !postal) {
    return { status: 400, body: { message: 'Missing required fields' } }
  }

  // Re-check the formats server-side; the client validation is only UX.
  if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
    return { status: 400, body: { message: 'Invalid phone number' } }
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 400, body: { message: 'Invalid email address' } }
  }
  if (!POSTAL_RE.test(postal)) {
    return { status: 400, body: { message: 'Invalid postal code' } }
  }

  // reCAPTCHA v3 — optional: skip when the token or the secret is absent.
  if (env.RECAPTCHA_SECRET && body.recaptchaToken) {
    try {
      const verification = await postWithTimeout(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: env.RECAPTCHA_SECRET,
            response: body.recaptchaToken,
          }),
        },
        RECAPTCHA_TIMEOUT_MS
      )
      const result = await verification.json()

      // Only a *scored* verdict is allowed to reject a lead. success:false
      // means the check could not be made at all — an unregistered domain, a
      // mismatched key pair, an expired or reused token. Blocking on that turns
      // one console misconfiguration into "every enquiry silently disappears",
      // and it buys nothing: a bot can already skip the token entirely, which
      // lands on the no-token path above. The honeypot and field validation
      // still apply either way.
      if (result.success === false) {
        console.warn(
          '[lead] reCAPTCHA could not verify, letting the lead through:',
          (result['error-codes'] || []).join(', ') || 'no error codes'
        )
      } else if (typeof result.score === 'number' && result.score < MIN_SCORE) {
        return {
          status: 403,
          body: { message: 'Failed reCAPTCHA verification', score: result.score },
        }
      }
    } catch {
      // Timeout or network error — let the lead through rather than lose it.
    }
  }

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return {
      status: 500,
      body: { success: false, error: 'Telegram is not configured' },
    }
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
    `<b>Email:</b> <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a>`,
    `<b>Postal code:</b> ${escapeHtml(postal.toUpperCase())}`,
    message ? `<b>Message:</b> ${escapeHtml(message)}` : '',
  ].filter(Boolean)

  const text = lines.join('\n') + (utmLines ? `\n\n${utmLines}` : '')

  try {
    const response = await postWithTimeout(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
      TELEGRAM_TIMEOUT_MS
    )

    const data = await response.json()
    if (!response.ok) {
      return { status: response.status, body: { success: false, error: data } }
    }
    return { status: 200, body: { success: true } }
  } catch (error) {
    return { status: 500, body: { success: false, error: String(error) } }
  }
}

export const METHOD_NOT_ALLOWED = {
  status: 405,
  body: { message: 'Method not allowed' },
}
