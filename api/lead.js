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
  message: 2000,
  utm: 200,
}

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
  const message = field(body.message, LIMITS.message)

  if (!name || !phone) {
    return res.status(400).json({ message: 'Missing required fields' })
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
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    email ? `<b>Email:</b> ${escapeHtml(email)}` : '',
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
