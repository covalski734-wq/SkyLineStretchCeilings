const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

let loader = null

/** Injects Google's script once, on first use — not on page load. */
function loadScript() {
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.grecaptcha)
    script.onerror = () => reject(new Error('reCAPTCHA script failed to load'))
    document.head.appendChild(script)
  })
  return loader
}

/**
 * Returns a v3 token, or null when reCAPTCHA is not configured or unreachable.
 * Never throws: a captcha problem must not cost a real lead — the server
 * simply skips verification when the token is missing.
 */
export async function getRecaptchaToken(action = 'lead') {
  if (!SITE_KEY) return null
  try {
    const grecaptcha = await loadScript()
    if (!grecaptcha) return null
    await new Promise((resolve) => grecaptcha.ready(resolve))
    return await grecaptcha.execute(SITE_KEY, { action })
  } catch {
    return null
  }
}
