const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
]
const STORAGE_KEY = 'skyline_utm'

/**
 * Reads UTM tags off the landing URL and remembers them for the session, so a
 * lead submitted after some scrolling and navigating still carries the ad
 * campaign it came from.
 */
export function captureUtm() {
  const params = new URLSearchParams(window.location.search)
  const found = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) found[key] = value.slice(0, 200)
  }
  if (!Object.keys(found).length) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  } catch {
    // Private mode / storage disabled — the lead just goes without UTM.
  }
}

export function readUtm() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
